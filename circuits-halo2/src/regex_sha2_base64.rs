use std::collections::HashMap;

use crate::regex_sha2::RegexSha2Config;
use base64::{engine::general_purpose, Engine as _};
use halo2_base::halo2_proofs::{
    circuit::{AssignedCell, Layouter, Region},
    plonk::{ConstraintSystem, Error},
};
use halo2_base::{
    gates::{flex_gate::FlexGateConfig, range::RangeConfig, RangeInstructions},
    utils::PrimeField,
    Context,
};
use halo2_base64::Base64Config;
use halo2_dynamic_sha256::Sha256DynamicConfig;
use halo2_regex::{
    defs::{AllstrRegexDef, RegexDefs, SubstrRegexDef},
    AssignedRegexResult,
};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone)]
pub struct RegexSha2Base64Result<'a, F: PrimeField> {
    pub regex: AssignedRegexResult<'a, F>,
    pub encoded_hash: Vec<AssignedCell<F, F>>,
    pub encoded_hash_value: Vec<u8>,
}

#[derive(Debug, Clone)]
pub struct RegexSha2Base64Config<F: PrimeField> {
    pub(crate) regex_sha2: RegexSha2Config<F>,
    pub(crate) base64_config: Base64Config<F>,
}

impl<F: PrimeField> RegexSha2Base64Config<F> {
    pub fn configure(
        meta: &mut ConstraintSystem<F>,
        max_byte_size: usize,
        // num_sha2_compression_per_column: usize,
        range_config: RangeConfig<F>,
        regex_defs: Vec<RegexDefs>,
    ) -> Self {
        let regex_sha2 = RegexSha2Config::configure(
            meta,
            max_byte_size,
            // num_sha2_compression_per_column,
            range_config,
            regex_defs,
        );
        let base64_config = Base64Config::configure(meta);
        Self { regex_sha2, base64_config }
    }

    pub fn match_hash_and_base64<'v: 'a, 'a>(
        &self,
        ctx: &mut Context<'v, F>,
        sha256_config: &mut Sha256DynamicConfig<F>,
        input: &[u8],
    ) -> Result<RegexSha2Base64Result<'a, F>, Error> {
        let regex_sha2_result = self.regex_sha2.match_and_hash(ctx, sha256_config, input)?;

        let actual_hash = Sha256::digest(input).to_vec();
        debug_assert_eq!(actual_hash.len(), 32);
        let mut hash_base64 = Vec::new();
        hash_base64.resize(44, 0);
        let bytes_written = general_purpose::STANDARD
            .encode_slice(&actual_hash, &mut hash_base64)
            .expect("fail to convert the hash bytes into the base64 strings");
        debug_assert_eq!(bytes_written, 44);
        let base64_result = self.base64_config.assign_values(&mut ctx.region, &hash_base64)?;
        debug_assert_eq!(base64_result.decoded.len(), 32);
        for (assigned_hash, assigned_decoded) in regex_sha2_result.hash_bytes.into_iter().zip(base64_result.decoded.into_iter()) {
            ctx.region.constrain_equal(assigned_hash.cell(), assigned_decoded.cell())?;
        }
        let result = RegexSha2Base64Result {
            regex: regex_sha2_result.regex,
            encoded_hash: base64_result.encoded,
            encoded_hash_value: hash_base64,
        };
        Ok(result)
    }

    // pub fn range(&self) -> &RangeConfig<F> {
    //     self.regex_sha2.range()
    // }

    // pub fn gate(&self) -> &FlexGateConfig<F> {
    //     self.range().gate()
    // }

    pub fn load(&self, layouter: &mut impl Layouter<F>) -> Result<(), Error> {
        self.regex_sha2.load(layouter)?;
        self.base64_config.load(layouter)?;
        Ok(())
    }

    // pub fn new_context<'a, 'b>(&'b self, region: Region<'a, F>) -> Context<'a, F> {
    //     self.regex_sha2.new_context(region)
    // }

    // pub fn finalize(&self, ctx: &mut Context<F>) {
    //     self.regex_sha2.finalize(ctx);
    // }
}
