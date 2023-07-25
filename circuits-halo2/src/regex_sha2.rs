use std::collections::HashMap;

use halo2_base::halo2_proofs::circuit::Region;
use halo2_base::halo2_proofs::plonk::ConstraintSystem;
use halo2_base::halo2_proofs::{circuit::Layouter, plonk::Error};
use halo2_base::QuantumCell;
use halo2_base::{
    gates::{flex_gate::FlexGateConfig, range::RangeConfig, GateInstructions, RangeInstructions},
    utils::PrimeField,
    AssignedValue, Context,
};
use halo2_dynamic_sha256::Sha256DynamicConfig;
use halo2_regex::{
    defs::{AllstrRegexDef, RegexDefs, SubstrRegexDef},
    AssignedRegexResult, RegexVerifyConfig,
};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Default)]
pub struct RegexSha2Result<'a, F: PrimeField> {
    pub regex: AssignedRegexResult<'a, F>,
    pub hash_bytes: Vec<AssignedValue<'a, F>>,
    pub hash_value: Vec<u8>,
}

#[derive(Debug, Clone)]
pub struct RegexSha2Config<F: PrimeField> {
    pub(crate) regex_config: RegexVerifyConfig<F>,
    pub max_byte_size: usize,
}

impl<F: PrimeField> RegexSha2Config<F> {
    pub fn configure(meta: &mut ConstraintSystem<F>, max_byte_size: usize, range_config: RangeConfig<F>, regex_defs: Vec<RegexDefs>) -> Self {
        let regex_config = RegexVerifyConfig::configure(meta, max_byte_size, range_config.gate().clone(), regex_defs);
        Self { regex_config, max_byte_size }
    }

    pub fn match_and_hash<'v: 'a, 'a>(&self, ctx: &mut Context<'v, F>, sha256_config: &mut Sha256DynamicConfig<F>, input: &[u8]) -> Result<RegexSha2Result<'a, F>, Error> {
        let max_input_size = self.max_byte_size;
        // 1. Let's match sub strings!
        let regex_result = self.regex_config.match_substrs(ctx, input)?;

        // Let's compute the hash!
        let assigned_hash_result = sha256_config.digest(ctx, input)?;
        // Assert that the same input is used in the regex circuit and the sha2 circuit.
        let gate = &sha256_config.range().gate();
        let mut input_len_sum = gate.load_zero(ctx);
        for idx in 0..max_input_size {
            let flag = &regex_result.all_enable_flags[idx];
            let regex_input = gate.mul(ctx, QuantumCell::Existing(flag), QuantumCell::Existing(&regex_result.all_characters[idx]));
            let sha2_input = gate.mul(ctx, QuantumCell::Existing(flag), QuantumCell::Existing(&assigned_hash_result.input_bytes[idx]));
            gate.assert_equal(ctx, QuantumCell::Existing(&regex_input), QuantumCell::Existing(&sha2_input));
            input_len_sum = gate.add(ctx, QuantumCell::Existing(&input_len_sum), QuantumCell::Existing(flag));
        }
        gate.assert_equal(ctx, QuantumCell::Existing(&input_len_sum), QuantumCell::Existing(&assigned_hash_result.input_len));
        let hash_value = Sha256::digest(input).to_vec();
        let result = RegexSha2Result {
            regex: regex_result,
            hash_bytes: assigned_hash_result.output_bytes,
            hash_value,
        };
        Ok(result)
    }

    pub fn load(&self, layouter: &mut impl Layouter<F>) -> Result<(), Error> {
        self.regex_config.load(layouter)?;
        // self.range().load_lookup_table(layouter)?;
        Ok(())
    }

    // pub fn new_context<'a, 'b>(&'b self, region: Region<'a, F>) -> Context<'a, F> {
    //     self.sha256_config.new_context(region)
    // }

    // pub fn finalize(&self, ctx: &mut Context<F>) {
    //     self.range().finalize(ctx);
    // }
}

#[cfg(test)]
mod test {
    use cfdkim::canonicalize_signed_email;
    use fancy_regex::Regex;
    use halo2_base::halo2_proofs::halo2curves::bn256::{Bn256, G1Affine};
    use halo2_base::halo2_proofs::plonk::{create_proof, keygen_pk, keygen_vk, verify_proof, ConstraintSystem};
    use halo2_base::halo2_proofs::poly::commitment::{Params, ParamsProver, ParamsVerifier};
    use halo2_base::halo2_proofs::poly::kzg::commitment::{KZGCommitmentScheme, ParamsKZG};
    use halo2_base::halo2_proofs::poly::kzg::multiopen::{ProverGWC, VerifierGWC};
    use halo2_base::halo2_proofs::poly::kzg::strategy::SingleStrategy;
    use halo2_base::halo2_proofs::transcript::{Blake2bRead, Blake2bWrite, Challenge255, TranscriptReadBuffer, TranscriptWriterBuffer};
    use halo2_regex::vrm::DecomposedRegexConfig;
    use rand::rngs::OsRng;
    use std::collections::HashSet;
    use std::marker::PhantomData;
    use std::path::Path;

    use super::*;

    use crate::utils::*;
    use halo2_base::halo2_proofs::{
        circuit::{floor_planner::V1, Cell, SimpleFloorPlanner},
        dev::{CircuitCost, FailureLocation, MockProver, VerifyFailure},
        halo2curves::bn256::{Fr, G1},
        plonk::{Any, Circuit, Column, Instance},
    };
    use halo2_base::{gates::range::RangeStrategy::Vertical, ContextParams, SKIP_FIRST_PASS};
    use itertools::Itertools;
    use sha2::{self, Digest, Sha256};
    use std::fs::File;
    use std::io::Read;

    #[derive(Debug, Clone)]
    struct TestRegexSha2Config<F: PrimeField> {
        inner: RegexSha2Config<F>,
        sha256_config: Sha256DynamicConfig<F>,
        hash_instance: Column<Instance>,
        masked_str_instance: Column<Instance>,
        substr_ids_instance: Column<Instance>,
    }

    #[derive(Debug, Clone)]
    struct TestRegexSha2<F: PrimeField> {
        input: Vec<u8>,
        _f: PhantomData<F>,
    }

    impl<F: PrimeField> Circuit<F> for TestRegexSha2<F> {
        type Config = TestRegexSha2Config<F>;
        type FloorPlanner = SimpleFloorPlanner;

        fn without_witnesses(&self) -> Self {
            Self { input: vec![], _f: PhantomData }
        }

        fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {
            let range_config = RangeConfig::configure(
                meta,
                Vertical,
                &[Self::NUM_ADVICE],
                &[Self::NUM_LOOKUP_ADVICE],
                Self::NUM_FIXED,
                Self::LOOKUP_BITS,
                0,
                Self::K as usize,
            );
            // let sha256_comp_configs = (0..Self::NUM_SHA2_COMP)
            //     .map(|_| Sha256CompressionConfig::configure(meta))
            //     .collect();
            let sha256_config = Sha256DynamicConfig::configure(meta, vec![Self::MAX_BYTE_SIZE], range_config.clone(), 16, 1, false);
            // let lookup_filepath = "./test_data/regex_test_lookup.txt";
            // let regex_def = AllstrRegexDef::read_from_text("");
            // let substr_def1 = SubstrRegexDef::new(
            //     4,
            //     0,
            //     Self::MAX_BYTE_SIZE as u64 - 1,
            //     HashSet::from([(29, 1), (1, 1)]),
            // );
            // let substr_def2 = SubstrRegexDef::new(
            //     11,
            //     0,
            //     Self::MAX_BYTE_SIZE as u64 - 1,
            //     HashSet::from([
            //         (4, 8),
            //         (8, 9),
            //         (9, 10),
            //         (10, 11),
            //         (11, 12),
            //         (12, 4),
            //         (12, 12),
            //     ]),
            // );
            let regex_defs = vec![
                RegexDefs {
                    allstr: AllstrRegexDef::read_from_text("./test_data/from_allstr.txt"),
                    substrs: vec![SubstrRegexDef::read_from_text("./test_data/from_substr_0.txt")],
                },
                RegexDefs {
                    allstr: AllstrRegexDef::read_from_text("./test_data/subject_allstr.txt"),
                    substrs: vec![
                        SubstrRegexDef::read_from_text("./test_data/subject_substr_0.txt"),
                        SubstrRegexDef::read_from_text("./test_data/subject_substr_1.txt"),
                        SubstrRegexDef::read_from_text("./test_data/subject_substr_2.txt"),
                    ],
                },
            ];
            let inner = RegexSha2Config::configure(meta, Self::MAX_BYTE_SIZE, range_config, regex_defs);
            let hash_instance = meta.instance_column();
            meta.enable_equality(hash_instance);
            let masked_str_instance = meta.instance_column();
            meta.enable_equality(masked_str_instance);
            let substr_ids_instance = meta.instance_column();
            meta.enable_equality(substr_ids_instance);
            Self::Config {
                inner,
                sha256_config,
                hash_instance,
                masked_str_instance,
                substr_ids_instance,
            }
        }

        fn synthesize(&self, mut config: Self::Config, mut layouter: impl Layouter<F>) -> Result<(), Error> {
            config.inner.load(&mut layouter)?;
            config.sha256_config.range().load_lookup_table(&mut layouter)?;
            config.sha256_config.load(&mut layouter)?;
            let mut first_pass = SKIP_FIRST_PASS;
            let mut hash_bytes_cell = vec![];
            let mut masked_str_cell = vec![];
            let mut substr_id_cell = vec![];

            layouter.assign_region(
                || "regex",
                |region| {
                    if first_pass {
                        first_pass = false;
                        return Ok(());
                    }
                    let ctx = &mut config.sha256_config.new_context(region);
                    let result = config.inner.match_and_hash(ctx, &mut config.sha256_config, &self.input)?;
                    config.sha256_config.range().finalize(ctx);
                    hash_bytes_cell.append(&mut result.hash_bytes.into_iter().map(|byte| byte.cell()).collect::<Vec<Cell>>());
                    masked_str_cell.append(
                        &mut result
                            .regex
                            .masked_characters
                            .into_iter()
                            .enumerate()
                            .map(|(idx, char)| {
                                // char.value().map(|v| {
                                //     println!(
                                //         "idx {} code {} char {}",
                                //         idx,
                                //         v.get_lower_32(),
                                //         (v.get_lower_32() as u8) as char
                                //     )
                                // });
                                char.cell()
                            })
                            .collect::<Vec<Cell>>(),
                    );
                    substr_id_cell.append(&mut result.regex.all_substr_ids.into_iter().map(|id| id.cell()).collect::<Vec<Cell>>());
                    Ok(())
                },
            )?;
            for (idx, cell) in hash_bytes_cell.into_iter().enumerate() {
                layouter.constrain_instance(cell, config.hash_instance, idx)?;
            }
            for (idx, cell) in masked_str_cell.into_iter().enumerate() {
                layouter.constrain_instance(cell, config.masked_str_instance, idx)?;
            }
            for (idx, cell) in substr_id_cell.into_iter().enumerate() {
                layouter.constrain_instance(cell, config.substr_ids_instance, idx)?;
            }

            Ok(())
        }
    }

    impl<F: PrimeField> TestRegexSha2<F> {
        const MAX_BYTE_SIZE: usize = 1024;
        // const NUM_SHA2_COMP: usize = 1; // ~130 columns per extra SHA2 coloumn
        const NUM_ADVICE: usize = 12;
        const NUM_FIXED: usize = 1;
        const NUM_LOOKUP_ADVICE: usize = 1;
        const LOOKUP_BITS: usize = 18;
        const K: u32 = 19;
    }

}
