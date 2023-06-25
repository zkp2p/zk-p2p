#[cfg(not(target_arch = "wasm32"))]
mod helpers;
pub mod regex_sha2;
pub mod regex_sha2_base64;
pub mod sign_verify;
pub mod utils;
use std::fs::File;

pub use crate::helpers::*;
use crate::regex_sha2::RegexSha2Config;
use crate::sign_verify::*;
use crate::utils::*;
use cfdkim::canonicalize_signed_email;
use cfdkim::resolve_public_key;
use halo2_base::halo2_proofs::circuit::{SimpleFloorPlanner, Value};
use halo2_base::halo2_proofs::plonk::{Circuit, Column, ConstraintSystem, Instance};
use halo2_base::halo2_proofs::{circuit::Layouter, plonk::Error};
use halo2_base::utils::{decompose_fe_to_u64_limbs, value_to_option};
use halo2_base::QuantumCell;
use halo2_base::{gates::range::RangeStrategy::Vertical, SKIP_FIRST_PASS};
use halo2_base::{
    gates::{range::RangeConfig, GateInstructions, RangeInstructions},
    utils::PrimeField,
};
pub use halo2_base64;
pub use halo2_dynamic_sha256;
use halo2_dynamic_sha256::*;
// pub use halo2_dynamic_sha256::{AssignedHashResult, Sha256DynamicConfig};
// use halo2_regex::defs::RegexDefs;
pub use halo2_regex;
use halo2_regex::defs::{AllstrRegexDef, RegexDefs, SubstrRegexDef};
use halo2_regex::*;
pub use halo2_rsa;
use halo2_rsa::*;
// use halo2_rsa::{AssignedRSAPublicKey, AssignedRSASignature, RSAConfig, RSAInstructions, RSAPubE, RSAPublicKey, RSASignature};
use itertools::Itertools;
use num_bigint::BigUint;
use regex_sha2_base64::RegexSha2Base64Config;
use rsa::PublicKeyParts;
use rsa::RsaPublicKey;
use sha2::{Digest, Sha256};
use snark_verifier::loader::LoadedScalar;
use snark_verifier_sdk::CircuitExt;
use std::io::{Read, Write};

// #[derive(Debug, Clone)]
// pub struct EmailVerifyResult<'a, F: PrimeField> {
//     pub assigned_headerhash: Vec<AssignedValue<'a, F>>,
//     pub assigned_bodyhash: Vec<AssignedCell<F, F>>,
//     pub header_result: AssignedRegexResult<'a, F>,
//     pub body_result: AssignedRegexResult<'a, F>,
//     pub headerhash_value: Vec<u8>,
//     pub bodyhash_value: Vec<u8>,
// }

// #[derive(Debug, Clone)]
// pub struct EmailVerifyConfig<F: PrimeField> {
//     header_processer: RegexSha2Config<F>,
//     body_processer: RegexSha2Base64Config<F>,
//     rsa_config: RSAConfig<F>,
// }

// impl<F: PrimeField> EmailVerifyConfig<F> {
//     pub fn configure(
//         meta: &mut ConstraintSystem<F>,
//         range_config: RangeConfig<F>,
//         header_max_byte_size: usize,
//         bodyhash_defs: RegexDefs,
//         header_regex_defs: Vec<RegexDefs>,
//         body_max_byte_size: usize,
//         body_regex_defs: Vec<RegexDefs>,
//         public_key_bits: usize,
//     ) -> Self {
//         let header_defs = [vec![bodyhash_defs], header_regex_defs].concat();
//         let header_processer = RegexSha2Config::configure(meta, header_max_byte_size, range_config.clone(), header_defs);
//         let body_processer = RegexSha2Base64Config::configure(meta, body_max_byte_size, range_config.clone(), body_regex_defs);
//         let biguint_config = halo2_rsa::BigUintConfig::construct(range_config, 64);
//         let rsa_config = RSAConfig::construct(biguint_config, public_key_bits, 5);
//         Self {
//             header_processer,
//             body_processer,
//             rsa_config,
//         }
//     }

//     pub fn assign_public_key<'v>(&self, ctx: &mut Context<'v, F>, public_key: RSAPublicKey<F>) -> Result<AssignedRSAPublicKey<'v, F>, Error> {
//         self.rsa_config.assign_public_key(ctx, public_key)
//     }

//     pub fn assign_signature<'v>(&self, ctx: &mut Context<'v, F>, signature: RSASignature<F>) -> Result<AssignedRSASignature<'v, F>, Error> {
//         self.rsa_config.assign_signature(ctx, signature)
//     }

//     pub fn verify_email<'v: 'a, 'a>(
//         &self,
//         ctx: &mut Context<'v, F>,
//         sha256_config: &mut Sha256DynamicConfig<F>,
//         header_bytes: &[u8],
//         body_bytes: &[u8],
//         public_key: &AssignedRSAPublicKey<'v, F>,
//         signature: &AssignedRSASignature<'v, F>,
//     ) -> Result<EmailVerifyResult<'a, F>, Error> {
//         let gate = sha256_config.range().gate.clone();

//         // 1. Extract sub strings in the body and compute the base64 encoded hash of the body.
//         let body_result = self.body_processer.match_hash_and_base64(ctx, sha256_config, body_bytes)?;

//         // 2. Extract sub strings in the header, which includes the body hash, and compute the raw hash of the header.
//         let header_result = self.header_processer.match_and_hash(ctx, sha256_config, header_bytes)?;

//         // 3. Verify the rsa signature.
//         let mut hashed_bytes = header_result.hash_bytes;
//         hashed_bytes.reverse();
//         let bytes_bits = hashed_bytes.len() * 8;
//         let limb_bits = self.rsa_config.biguint_config().limb_bits;
//         let limb_bytes = limb_bits / 8;
//         let mut hashed_u64s = vec![];
//         let bases = (0..limb_bytes)
//             .map(|i| F::from((1u64 << (8 * i)) as u64))
//             .map(QuantumCell::Constant)
//             .collect::<Vec<QuantumCell<F>>>();
//         for i in 0..(bytes_bits / limb_bits) {
//             let left = hashed_bytes[limb_bytes * i..limb_bytes * (i + 1)]
//                 .iter()
//                 .map(QuantumCell::Existing)
//                 .collect::<Vec<QuantumCell<F>>>();
//             let sum = gate.inner_product(ctx, left, bases.clone());
//             hashed_u64s.push(sum);
//         }
//         let is_sign_valid = self.rsa_config.verify_pkcs1v15_signature(ctx, public_key, &hashed_u64s, signature)?;
//         gate.assert_is_const(ctx, &is_sign_valid, F::one());
//         hashed_bytes.reverse();
//         // [IMPORTANT] Here, we don't verify that the encoded hash value is equal to the value in the email header.
//         // To constraint their equivalences, you should put these values in the instance column and specify the same hash bytes.

//         // 4. Check that the encoded hash value is equal to the value in the email header.
//         // let hash_body_substr = &header_result.regex.substrs_bytes[0];
//         // let body_encoded_hash = body_result.encoded_hash;
//         // debug_assert_eq!(hash_body_substr.len(), body_encoded_hash.len());
//         // for (substr_byte, encoded_byte) in
//         //     hash_body_substr.iter().zip(body_encoded_hash.into_iter())
//         // {
//         //     ctx.region
//         //         .constrain_equal(substr_byte.cell(), encoded_byte.cell())?;
//         // }
//         // gate.assert_is_const(ctx, &header_result.substrs.substrs_length[0], F::from(44));
//         Ok(EmailVerifyResult {
//             assigned_headerhash: hashed_bytes,
//             assigned_bodyhash: body_result.encoded_hash,
//             header_result: header_result.regex,
//             body_result: body_result.regex,
//             headerhash_value: header_result.hash_value,
//             bodyhash_value: body_result.encoded_hash_value,
//         })
//     }

//     pub fn load(&self, layouter: &mut impl Layouter<F>) -> Result<(), Error> {
//         self.header_processer.load(layouter)?;
//         self.body_processer.load(layouter)?;
//         Ok(())
//     }
// }

pub const EMAIL_VERIFY_CONFIG_ENV: &'static str = "EMAIL_VERIFY_CONFIG";
#[derive(serde::Serialize, serde::Deserialize)]
pub struct Sha2ConfigParams {
    pub num_bits_lookup: usize,
    pub num_advice_columns: usize,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct HeaderConfigParams {
    pub bodyhash_allstr_filepath: String,
    pub bodyhash_substr_filepath: String,
    pub allstr_filepathes: Vec<String>,
    pub substr_filepathes: Vec<Vec<String>>,
    pub max_byte_size: usize,
    pub substr_regexes: Vec<Vec<String>>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct BodyConfigParams {
    pub allstr_filepathes: Vec<String>,
    pub substr_filepathes: Vec<Vec<String>>,
    pub max_byte_size: usize,
    pub substr_regexes: Vec<Vec<String>>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SignVerifyConfigParams {
    pub public_key_bits: usize,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct DefaultEmailVerifyConfigParams {
    pub degree: u32,
    pub num_flex_advice: usize,
    pub num_range_lookup_advice: usize,
    pub num_flex_fixed: usize,
    pub range_lookup_bits: usize,
    pub sha256_config: Option<Sha2ConfigParams>,
    pub sign_verify_config: Option<SignVerifyConfigParams>,
    pub header_config: Option<HeaderConfigParams>,
    pub body_config: Option<BodyConfigParams>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DefaultEmailVerifyPublicInput {
    pub headerhash: String,
    pub public_key_n_bytes: String,
    pub header_starts: Vec<usize>,
    pub header_substrs: Vec<String>,
    pub body_starts: Vec<usize>,
    pub body_substrs: Vec<String>,
}

impl DefaultEmailVerifyPublicInput {
    pub fn new(headerhash: Vec<u8>, public_key_n: BigUint, header_substrs: Vec<Option<(usize, String)>>, body_substrs: Vec<Option<(usize, String)>>) -> Self {
        let mut header_starts_vec = vec![];
        let mut header_substrs_vec = vec![];
        for s in header_substrs.into_iter() {
            if let Some(s) = s {
                header_starts_vec.push(s.0);
                header_substrs_vec.push(s.1);
            }
        }
        let mut body_starts_vec = vec![];
        let mut body_substrs_vec = vec![];
        for s in body_substrs.into_iter() {
            if let Some(s) = s {
                body_starts_vec.push(s.0);
                body_substrs_vec.push(s.1);
            }
        }
        DefaultEmailVerifyPublicInput {
            headerhash: format!("0x{}", hex::encode(&headerhash)),
            public_key_n_bytes: format!("0x{}", hex::encode(&public_key_n.to_bytes_le())),
            header_starts: header_starts_vec,
            header_substrs: header_substrs_vec,
            body_starts: body_starts_vec,
            body_substrs: body_substrs_vec,
        }
    }

    pub fn write_file(&self, public_input_path: &str) {
        let public_input_str = serde_json::to_string(&self).unwrap();
        let mut file = File::create(public_input_path).expect("public_input_path creation failed");
        write!(file, "{}", public_input_str).unwrap();
        file.flush().unwrap();
    }
}

#[derive(Debug, Clone)]
pub struct DefaultEmailVerifyConfig<F: PrimeField> {
    sha256_config: Sha256DynamicConfig<F>,
    sign_verify_config: SignVerifyConfig<F>,
    header_config: RegexSha2Config<F>,
    body_config: RegexSha2Base64Config<F>,
    public_hash: Column<Instance>,
}

#[derive(Debug, Clone)]
pub struct DefaultEmailVerifyCircuit<F: PrimeField> {
    pub header_bytes: Vec<u8>,
    pub body_bytes: Vec<u8>,
    pub public_key: RSAPublicKey<F>,
    pub signature: RSASignature<F>,
}

impl<F: PrimeField> Circuit<F> for DefaultEmailVerifyCircuit<F> {
    type Config = DefaultEmailVerifyConfig<F>;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            header_bytes: vec![],
            body_bytes: vec![],
            public_key: self.public_key.clone(),
            signature: self.signature.clone(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {
        let params = Self::read_config_params();
        let range_config = RangeConfig::configure(
            meta,
            Vertical,
            &[params.num_flex_advice],
            &[params.num_range_lookup_advice],
            params.num_flex_advice,
            params.range_lookup_bits,
            0,
            params.degree as usize,
        );
        let header_config = params.header_config.expect("header_config is required");
        let body_config = params.body_config.expect("body_config is required");
        let sign_verify_config = params.sign_verify_config.expect("sign_verify_config is required");
        let sha256_config = params.sha256_config.expect("sha256_config is required");
        assert_eq!(header_config.allstr_filepathes.len(), header_config.substr_filepathes.len());
        assert_eq!(body_config.allstr_filepathes.len(), body_config.substr_filepathes.len());

        let sha256_config = Sha256DynamicConfig::configure(
            meta,
            vec![
                body_config.max_byte_size,
                header_config.max_byte_size,
                128 + sign_verify_config.public_key_bits / 8 + 2 * (header_config.max_byte_size + body_config.max_byte_size) + 64, // (header hash, base64 body hash, padding, RSA public key, masked chars, substr ids)
            ],
            range_config.clone(),
            sha256_config.num_bits_lookup,
            sha256_config.num_advice_columns,
            false,
        );

        let sign_verify_config = SignVerifyConfig::configure(meta, range_config.clone(), sign_verify_config.public_key_bits);

        // assert_eq!(params.body_regex_filepathes.len(), params.body_substr_filepathes.len());
        let bodyhash_allstr_def = AllstrRegexDef::read_from_text(&header_config.bodyhash_allstr_filepath);
        let bodyhash_substr_def = SubstrRegexDef::read_from_text(&header_config.bodyhash_substr_filepath);
        let bodyhash_defs = RegexDefs {
            allstr: bodyhash_allstr_def,
            substrs: vec![bodyhash_substr_def],
        };
        let header_regex_defs = header_config
            .allstr_filepathes
            .iter()
            .zip(header_config.substr_filepathes.iter())
            .map(|(allstr_path, substr_pathes)| {
                let allstr = AllstrRegexDef::read_from_text(&allstr_path);
                let substrs = substr_pathes.into_iter().map(|path| SubstrRegexDef::read_from_text(&path)).collect_vec();
                RegexDefs { allstr, substrs }
            })
            .collect_vec();
        let header_config = RegexSha2Config::configure(
            meta,
            header_config.max_byte_size,
            range_config.clone(),
            vec![vec![bodyhash_defs], header_regex_defs].concat(),
        );

        let body_regex_defs = body_config
            .allstr_filepathes
            .iter()
            .zip(body_config.substr_filepathes.iter())
            .map(|(allstr_path, substr_pathes)| {
                let allstr = AllstrRegexDef::read_from_text(&allstr_path);
                let substrs = substr_pathes.into_iter().map(|path| SubstrRegexDef::read_from_text(&path)).collect_vec();
                RegexDefs { allstr, substrs }
            })
            .collect_vec();
        let body_config = RegexSha2Base64Config::configure(meta, body_config.max_byte_size, range_config, body_regex_defs);

        let public_hash = meta.instance_column();
        meta.enable_equality(public_hash);
        DefaultEmailVerifyConfig {
            sha256_config,
            sign_verify_config,
            header_config,
            body_config,
            public_hash,
        }
    }

    fn synthesize(&self, mut config: Self::Config, mut layouter: impl Layouter<F>) -> Result<(), Error> {
        config.sha256_config.range().load_lookup_table(&mut layouter)?;
        config.sha256_config.load(&mut layouter)?;
        config.header_config.load(&mut layouter)?;
        config.body_config.load(&mut layouter)?;
        let mut first_pass = SKIP_FIRST_PASS;
        let mut public_hash_cell = vec![];
        let params = Self::read_config_params();
        layouter.assign_region(
            || "zkemail",
            |region| {
                if first_pass {
                    first_pass = false;
                    return Ok(());
                }
                let ctx = &mut config.sha256_config.new_context(region);
                // 1. Extract sub strings in the body and compute the base64 encoded hash of the body.
                let body_result = config.body_config.match_hash_and_base64(ctx, &mut config.sha256_config, &self.body_bytes)?;

                // 2. Extract sub strings in the header, which includes the body hash, and compute the raw hash of the header.
                let header_result = config.header_config.match_and_hash(ctx, &mut config.sha256_config, &self.header_bytes)?;

                // 3. Verify the rsa signature.
                let (assigned_public_key, _) = config
                    .sign_verify_config
                    .verify_signature(ctx, &header_result.hash_bytes, self.public_key.clone(), self.signature.clone())?;

                let public_hash_input = {
                    let header_str = String::from_utf8(self.header_bytes.clone()).unwrap();
                    let body_str = String::from_utf8(self.body_bytes.clone()).unwrap();
                    let params = Self::read_config_params();
                    let header_config = params.header_config.expect("header_config is required");
                    let body_config = params.body_config.expect("body_config is required");
                    let (header_substrs, body_substrs) = get_email_substrs(&header_str, &body_str, header_config.substr_regexes, body_config.substr_regexes);
                    get_email_circuit_public_hash_input(
                        &header_result.hash_value,
                        &value_to_option(self.public_key.n.clone()).unwrap().to_bytes_le(),
                        header_substrs,
                        body_substrs,
                        header_config.max_byte_size,
                        body_config.max_byte_size,
                    )
                };
                let public_hash_result: AssignedHashResult<F> = config.sha256_config.digest(ctx, &public_hash_input)?;
                // for (idx, v) in public_hash_result.input_bytes[128..(128 + 256)].iter().enumerate() {
                //     v.value().map(|v| println!("idx {} code {}", idx, v.get_lower_32()));
                // }
                let range = config.sha256_config.range().clone();
                let gate = range.gate.clone();
                for (idx, v) in header_result.regex.masked_characters.iter().enumerate() {
                    v.value()
                        .map(|v| {
                            let code = v.get_lower_32();
                            if code != 0 {
                                println!("idx {} code {} char {}", idx, code, (code as u8) as char)
                            }
                        });
                }
                for (idx, v) in body_result.regex.masked_characters.iter().enumerate() {
                    v.value()
                        .map(|v| {
                            let code = v.get_lower_32();
                            if code != 0 {
                                println!("idx {} code {} char {}", idx, code, (code as u8) as char)
                            }
                        });
                }
                let assigned_public_key_bytes = assigned_public_key
                    .n
                    .limbs()
                    .into_iter()
                    .flat_map(|limb| {
                        let limb_val = value_to_option(limb.value()).unwrap();
                        let bytes = decompose_fe_to_u64_limbs(limb_val, 64 / 8, 8);
                        let mut sum = gate.load_zero(ctx);
                        let assigned = bytes
                            .into_iter()
                            .enumerate()
                            .map(|(idx, byte)| {
                                let assigned = gate.load_witness(ctx, Value::known(F::from(byte)));
                                range.range_check(ctx, &assigned, 8);
                                sum = gate.mul_add(
                                    ctx,
                                    QuantumCell::Existing(&assigned),
                                    QuantumCell::Constant(F::from(1u64 << (8 * idx))),
                                    QuantumCell::Existing(&sum),
                                );
                                assigned
                            })
                            .collect_vec();
                        gate.assert_equal(ctx, QuantumCell::Existing(&sum), QuantumCell::Existing(limb));
                        assigned
                    })
                    .collect_vec();
                // for (idx, v) in assigned_public_key_bytes.iter().enumerate() {
                //     v.value().map(|v| println!("idx {} byte {}", 128 + idx, v.get_lower_32()));
                // }
                let assigned_public_hash_input = vec![
                    header_result.hash_bytes.into_iter().map(|v| v.cell()).collect_vec(),
                    body_result.encoded_hash.into_iter().map(|v| v.cell()).collect_vec(),
                    vec![gate.load_zero(ctx).cell(); 128 - 32 - 44],
                    assigned_public_key_bytes.into_iter().map(|v| v.cell()).collect_vec(),
                    vec![header_result.regex.masked_characters, body_result.regex.masked_characters]
                        .concat()
                        .into_iter()
                        .map(|v| v.cell())
                        .collect_vec(),
                    vec![header_result.regex.all_substr_ids, body_result.regex.all_substr_ids]
                        .concat()
                        .into_iter()
                        .map(|v| v.cell())
                        .collect_vec(),
                ]
                .concat();
                for (a, b) in public_hash_result.input_bytes[0..assigned_public_hash_input.len()]
                    .into_iter()
                    .map(|v| v.cell())
                    .collect_vec()
                    .into_iter()
                    .zip(assigned_public_hash_input.into_iter())
                {
                    ctx.region.constrain_equal(a, b)?;
                }
                debug_assert_eq!(public_hash_result.output_bytes.len(), 32);
                let mut packed_public_hash = gate.load_zero(ctx);
                let mut coeff = F::from(1u64);
                for byte in public_hash_result.output_bytes[0..31].iter() {
                    packed_public_hash = gate.mul_add(ctx, QuantumCell::Existing(byte), QuantumCell::Constant(coeff), QuantumCell::Existing(&packed_public_hash));
                    coeff *= F::from(256u64);
                }
                config.sha256_config.range().finalize(ctx);
                public_hash_cell.push(packed_public_hash.cell());
                Ok(())
            },
        )?;
        layouter.constrain_instance(public_hash_cell[0], config.public_hash, 0)?;
        Ok(())
    }
}

impl<F: PrimeField> CircuitExt<F> for DefaultEmailVerifyCircuit<F> {
    fn num_instance(&self) -> Vec<usize> {
        vec![1]
    }

    fn instances(&self) -> Vec<Vec<F>> {
        let headerhash_value = Sha256::digest(&self.header_bytes).to_vec();
        // println!("header hash {}", hex::encode(&headerhash_value));
        let header_str = String::from_utf8(self.header_bytes.clone()).unwrap();
        let body_str = String::from_utf8(self.body_bytes.clone()).unwrap();
        let params = Self::read_config_params();
        let header_config = params.header_config.expect("header_config is required");
        let body_config = params.body_config.expect("body_config is required");
        let (header_substrs, body_substrs) = get_email_substrs(&header_str, &body_str, header_config.substr_regexes, body_config.substr_regexes);
        let public_hash_input = get_email_circuit_public_hash_input(
            &headerhash_value,
            &value_to_option(self.public_key.n.clone()).unwrap().to_bytes_le(),
            header_substrs,
            body_substrs,
            header_config.max_byte_size,
            body_config.max_byte_size,
        );
        let public_hash: Vec<u8> = Sha256::digest(&public_hash_input).to_vec();
        // println!("public hash {}", hex::encode(public_hash.clone()));
        let public_fr = {
            let lo = F::from_u128(u128::from_le_bytes(public_hash[0..16].try_into().unwrap()));
            let mut hi_bytes = [0; 16];
            for idx in 0..15 {
                hi_bytes[idx] = public_hash[16 + idx];
            }
            let hi = F::from_u128(u128::from_le_bytes(hi_bytes));
            hi * F::from(2).pow_const(128) + lo
        };
        // println!("public fr {:?}", public_fr.to_repr(),);
        vec![vec![public_fr]]
    }
}

impl<F: PrimeField> DefaultEmailVerifyCircuit<F> {
    pub const DEFAULT_E: u128 = 65537;

    pub fn read_config_params() -> DefaultEmailVerifyConfigParams {
        read_default_circuit_config_params()
    }

    pub async fn gen_circuit_from_email_path(email_path: &str) -> (Self, Vec<u8>, BigUint, Vec<Option<(usize, String)>>, Vec<Option<(usize, String)>>) {
        let email_bytes = {
            let mut f = File::open(email_path).unwrap();
            let mut buf = Vec::new();
            f.read_to_end(&mut buf).unwrap();
            buf
        };
        println!("email {}", String::from_utf8(email_bytes.clone()).unwrap());
        let (canonicalized_header, canonicalized_body, signature_bytes) = canonicalize_signed_email(&email_bytes).unwrap();
        let headerhash = Sha256::digest(&canonicalized_header).to_vec();
        let public_key_n = {
            let logger = slog::Logger::root(slog::Discard, slog::o!());
            match resolve_public_key(&logger, &email_bytes).await.unwrap() {
                cfdkim::DkimPublicKey::Rsa(_pk) => BigUint::from_radix_le(&_pk.n().clone().to_radix_le(16), 16).unwrap(),
                _ => {
                    panic!("Only RSA keys are supported.");
                }
            }
        };
        let e = RSAPubE::Fix(BigUint::from(Self::DEFAULT_E));
        let public_key = RSAPublicKey::<F>::new(Value::known(public_key_n.clone()), e);
        let signature = RSASignature::<F>::new(Value::known(BigUint::from_bytes_be(&signature_bytes)));
        let header_str = String::from_utf8(canonicalized_header.clone()).unwrap();
        let body_str = String::from_utf8(canonicalized_body.clone()).unwrap();
        let config_params = Self::read_config_params();
        let header_config = config_params.header_config.expect("header_config is required");
        let body_config = config_params.body_config.expect("body_config is required");
        let (header_substrs, body_substrs) = get_email_substrs(&header_str, &body_str, header_config.substr_regexes, body_config.substr_regexes);
        let circuit = Self {
            header_bytes: canonicalized_header,
            body_bytes: canonicalized_body,
            public_key,
            signature,
        };
        (circuit, headerhash, public_key_n, header_substrs, body_substrs)
    }

    pub fn get_instances_from_default_public_input(public_input_path: &str) -> Vec<F> {
        let public_input = serde_json::from_reader::<File, DefaultEmailVerifyPublicInput>(File::open(public_input_path).unwrap()).unwrap();
        let config_params = read_default_circuit_config_params();
        let header_config = config_params.header_config.expect("header_config is required");
        let body_config = config_params.body_config.expect("body_config is required");
        let headerhash = hex::decode(&public_input.headerhash[2..]).unwrap();
        let public_key_n_bytes = hex::decode(&public_input.public_key_n_bytes[2..]).unwrap();
        let header_substrs = public_input
            .header_starts
            .into_iter()
            .zip(public_input.header_substrs.into_iter())
            .map(|(start, substr)| Some((start, substr)))
            .collect_vec();
        let body_substrs = public_input
            .body_starts
            .into_iter()
            .zip(public_input.body_substrs.into_iter())
            .map(|(start, substr)| Some((start, substr)))
            .collect_vec();
        let public_hash_input = get_email_circuit_public_hash_input(
            &headerhash,
            &public_key_n_bytes,
            header_substrs,
            body_substrs,
            header_config.max_byte_size,
            body_config.max_byte_size,
        );
        let public_hash: Vec<u8> = Sha256::digest(&public_hash_input).to_vec();
        let public_fr = {
            let lo = F::from_u128(u128::from_le_bytes(public_hash[0..16].try_into().unwrap()));
            let mut hi_bytes = [0; 16];
            for idx in 0..15 {
                hi_bytes[idx] = public_hash[16 + idx];
            }
            let hi = F::from_u128(u128::from_le_bytes(hi_bytes));
            hi * F::from(2).pow_const(128) + lo
        };
        vec![public_fr]
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use cfdkim::{canonicalize_signed_email, resolve_public_key, SignerBuilder};
    use halo2_base::halo2_proofs::{
        circuit::Value,
        dev::{CircuitCost, FailureLocation, MockProver, VerifyFailure},
        halo2curves::bn256::{Fr, G1},
    };
    use halo2_regex::vrm::DecomposedRegexConfig;
    use halo2_rsa::RSAPubE;
    use mailparse::parse_mail;
    use num_bigint::BigUint;
    use rand::thread_rng;
    use rsa::{PublicKeyParts, RsaPrivateKey};
    use snark_verifier_sdk::CircuitExt;
    use std::{fs::File, io::Read, path::Path};
    use temp_env;

    #[test]
    fn test_generated_email3() {
        temp_env::with_var(EMAIL_VERIFY_CONFIG_ENV, Some("./configs/test3_email_verify.config"), || {
            let regex_bodyhash_decomposed: DecomposedRegexConfig = serde_json::from_reader(File::open("./test_data/bodyhash_defs.json").unwrap()).unwrap();
            regex_bodyhash_decomposed
                .gen_regex_files(
                    &Path::new("./test_data/bodyhash_allstr.txt").to_path_buf(),
                    &[Path::new("./test_data/bodyhash_substr_0.txt").to_path_buf()],
                )
                .unwrap();
            let regex_timestamp_decomposed: DecomposedRegexConfig = serde_json::from_reader(File::open("./test_data/timestamp_defs.json").unwrap()).unwrap();
            regex_timestamp_decomposed
                .gen_regex_files(
                    &Path::new("./test_data/timestamp_allstr.txt").to_path_buf(),
                    &[Path::new("./test_data/timestamp_substr_0.txt").to_path_buf()],
                )
                .unwrap();
            let regex_body_decomposed: DecomposedRegexConfig = serde_json::from_reader(File::open("./test_data/test3_email_body_defs.json").unwrap()).unwrap();
            regex_body_decomposed
                .gen_regex_files(
                    &Path::new("./test_data/test3_email_body_allstr.txt").to_path_buf(),
                    &[
                        Path::new("./test_data/test3_email_body_substr_0.txt").to_path_buf()
                    ],
                )
                .unwrap();
            let params = DefaultEmailVerifyCircuit::<Fr>::read_config_params();
            let sign_verify_config = params.sign_verify_config.expect("sign_verify_config is required");
            let mut rng = thread_rng();
            let _private_key = RsaPrivateKey::new(&mut rng, sign_verify_config.public_key_bits).expect("failed to generate a key");
            let public_key = rsa::RsaPublicKey::from(&_private_key);
            let private_key = cfdkim::DkimPrivateKey::Rsa(_private_key);
            let message = concat!(
                "From: alice@zkemail.com\r\n",
                "\r\n",
                "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\"",
                "\r\n \"http://www.w3.org/TR/html4/strict.dtd\">",
                "\r\n<html class=3D\"\"  id=3D\"html_container\" xmlns=3D\"http://www.w3.org/1999/xht=",
                "\r\nml\" dir=3D\"ltr\" lang=3D\"en-US\" xmlns:fb=3D\"http://www.facebook.com/2008/fbm=",
                "\r\nl\">",
                "\r\n    <head>",
                "\r\n        <meta http-equiv=3D\"Content-Type\" content=3D\"text/html; charset=3Du=",
                "\r\ntf-8\">",
                "\r\n        <title> - Venmo</title>",
                "\r\n    </head>",
                "\r\n",
                "\r\n    <body style=3D\"margin:0;color: #2F3033\">",
                "\r\n    =20",
                "\r\n        <div style=3D\"font-family:'helvetica neue';\">",
                "\r\n            <div style=3D\"margin: 0 auto; max-width: 320px;\">",
                "\r\n                <div style=3D\"font-size:14px;border: 2px solid #e8ebea;\">",
                "\r\n                    <div style=3D\"padding: 10px 0; text-align: center; back=",
                "\r\nground-color: #0074DE;\">",
                "\r\n                        <img src=3D\"https://s3.amazonaws.com/venmo/venmo-lo=",
                "\r\ngo-white.png\" alt=3D\"venmo\" title=3D\"venmo\" style=3D\"color: #fff;width:125p=",
                "\r\nx;height:24px;\" />",
                "\r\n                    </div>",
                "\r\n                =20",
                "\r\n                    <div style=3D\"padding:20px;background-color:#fff;\">",
                "\r\n                    =20",
                "\r\n<div width=3D\"100%\" >",
                "\r\n=20",
                "\r\n",
                "\r\n",
                "\r\n",
                "\r\n=20",
                "\r\n",
                "\r\n<table id=3D\"_story\" width=3D\"100%\"> <tbody>",
                "\r\n    <tr>",
                "\r\n        <!-- img of actor -->",
                "\r\n        <td valign=3D\"top\" width=3D\"48px\" style=3D\"padding-right:10px;\">",
                "\r\n            <a href=3D\"https://venmo.com/code?user_id=3D123456789012345678&=",
                "\r\nactor_id=3D1234567890123456789\" aria-label=3D\"\">",
                "\r\n                <img src=3D\"https://pics.venmo.com/1e68216f-43a7-45d5-a89f-=",
                "\r\nbecba0754c98?width=3D100&amp;height=3D100&amp;photoVersion=3D1\" alt=3D\"\" st=",
                "\r\nyle=3D\"border-radius:3px;width:48px;height:48px;\"/>",
                "\r\n            </a>",
                "\r\n        </td>",
                "\r\n        <td style=3D\"font-size:14px;color:#2F3033;vertical-align:top;paddin=",
                "\r\ng-left:2px;\">",
                "\r\n            <div >",
                "\r\n                <!-- actor name -->",
                "\r\n                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=",
                "\r\ntps://venmo.com/code?user_id=3D123456789012345678&actor_id=3D12345678901234=",
                "\r\n56789\">",
                "\r\n                    Steve Wozniak",
                "\r\n                </a>",
                "\r\n                <!-- action -->",
                "\r\n                <span>",
                "\r\n                    paid",
                "\r\n                </span>",
                "\r\n            =20",
                "\r\n                <!-- recipient name -->",
                "\r\n                <a style=3D\"color:#0074DE; text-decoration:none\"",
                "\r\n                =20",
                "\r\n                    href=3D\"https://venmo.com/code?user_id=3D12345678901234=",
                "\r\n56789&actor_id=3D1234567890123456789\">",
                "\r\n                =20",
                "\r\n                    You",
                "\r\n                </a>",
                "\r\n            =20",
                "\r\n            </div>",
                "\r\n            <!-- note -->",
                "\r\n            <div>",
                "\r\n                <p>Test</p>",
                "\r\n            </div>",
                "\r\n        </td>",
                "\r\n    </tr>",
                "\r\n    <tr>",
                "\r\n        <td></td>",
                "\r\n        <td style=3D\"font-size:14px;padding-left:2px;color:#2F3033;\">",
                "\r\n            Transfer Date and Amount:",
                "\r\n        </td>",
                "\r\n    </tr>",
                "\r\n    <tr>",
                "\r\n        <td></td>",
                "\r\n        <td style=3D\"font-size:14px;padding-left:2px;color:#2F3033;\">",
                "\r\n        <!-- date, audience, and amount -->",
                "\r\n            <span>Jun 06, 2023 PDT</span>",
                "\r\n            <span> =C2=B7 </span>",
                "\r\n            <img style=3D\"vertical-align: -1px; width: 12px; height: 12px;\"=",
                "\r\nsrc=3D\"https://s3.amazonaws.com/venmo/audience/private_v2.png\" alt=3D\"priv=",
                "\r\nate\"/>",
                "\r\n        =20",
                "\r\n",
                "\r\n            <!-- amount -->",
                "\r\n        =20",
                "\r\n            =20",
                "\r\n                <span style=3D\"color:#148572;float:right;\">",
                "\r\n                =20",
                "\r\n                    + $5.00",
                "\r\n                =20",
                "\r\n                </span>",
                "\r\n            =20",
                "\r\n        =20",
                "\r\n        </td>",
                "\r\n    </tr>",
                "\r\n=20",
                "\r\n=20",
                "\r\n=20",
                "\r\n    <tr>",
                "\r\n        <td></td>",
                "\r\n        <td style=3D\"padding-top:10px;\">",
                "\r\n            <table style=3D\"width:170px; table-layout:fixed;font-size:14px;=",
                "\r\n\">",
                "\r\n                <tbody>",
                "\r\n                <tr>",
                "\r\n                =20",
                "\r\n                    <td style=3D\"padding:5px 0; text-align:center; border-r=",
                "\r\nadius:50px; background-color:#0074DE;\" >",
                "\r\n                        <a href=3D\"https://venmo.com/story/1234567890123456=",
                "\r\n789?k=3D9869d2e2-ea24-4c87-9ee1-6c1ab1efb91d\" style=3D\"text-decoration:none=",
                "\r\n; color: #fff;display:block;width:100%;\">",
                "\r\n                                Like",
                "\r\n                        </a>",
                "\r\n                    </td>",
                "\r\n                =20",
                "\r\n                =20",
                "\r\n                    <td style=3D\"padding:5px 0; border-radius:50px; text-al=",
                "\r\nign:center;background-color:#0074DE;\" >",
                "\r\n                        <a href=3D\"https://venmo.com/story/1234567890123456=",
                "\r\n789?login=3D1\" style=3D\"text-decoration:none; color: #fff;display:block;wid=",
                "\r\nth:100%;\">",
                "\r\n                            Comment",
                "\r\n                        </a>",
                "\r\n                    </td>",
                "\r\n                =20",
                "\r\n                </tr>",
                "\r\n                </tbody>",
                "\r\n            </table>",
                "\r\n        </td>",
                "\r\n    </tr>",
                "\r\n=20",
                "\r\n</tbody> </table>",
                "\r\n",
                "\r\n",
                "\r\n",
                "\r\n",
                "\r\n",
                "\r\n    <div style=3D\"color:#6B6E76;font-size:12px;margin-top:10px;padding-top:=",
                "\r\n10px; border-top: 1px dotted #ccc\">",
                "\r\n=20",
                "\r\n        <p>Money credited to your Venmo account.</p>",
                "\r\n        <a style=3D\"text-decoration:none;color:#0074de;\" href=3D\"https://ve=",
                "\r\nnmo.com/cash_out\">Transfer to your bank</a>.",
                "\r\n=20",
                "\r\n    <p>Payment ID: 9999999999999999999</p>",
                "\r\n=20",
                "\r\n</div>",
                "\r\n=20",
                "\r\n=20",
                "\r\n<div style=3D\"color:#6B6E76;font-size:12px;margin-top:10px;padding-top:10px=",
                "\r\n; border-top: 1px dotted #ccc\">",
                "\r\n    <div style=3D\"width:50%; padding:5px; text-align:center; border-radius:=",
                "\r\n50px; background-color:#0074DE;\">",
                "\r\n        <a href=3D\"https://venmo.com/referral/invite?campaign_service=3Dema=",
                "\r\nil&campaign_template=3Dpayment.received\" style=3D\"text-decoration:none; col=",
                "\r\nor: #000; display:block; width:100%; font-size:12px;\">",
                "\r\n            <div style=3D\"font-size:14px; color:#fff;\">Invite Friends!</div=",
                "\r\n>",
                "\r\n        </a>",
                "\r\n    </div>",
                "\r\n",
                "\r\n",
                "\r\n</div>",
                "\r\n",
                "\r\n    <div id=3D\"_receipt_disclosures\" style=3D\"font-size:11px;margin-top:10p=",
                "\r\nx;padding-top:10px; border-top: 1px dotted #ccc\">",
                "\r\n",
                "\r\n    <div>",
                "\r\n        For any issues, including the recipient not receiving funds, please=",
                "\r\ncontact us at support@venmo.com or call 1-855-812-4430.",
                "\r\n    </div>",
                "\r\n",
                "\r\n",
                "\r\n    <div style=3D\"margin-top:10px;\">",
                "\r\n        See our <a style=3D\"text-decoration:none;color:#0074DE\" href=3D\"htt=",
                "\r\nps://venmo.com/legal/regulatory-agency-california\">disclosures</a> for more=",
                "\r\ninformation.<div style=3D\"margin-top:10px;\">Please do not reply directly t=",
                "\r\no this email. For more assistance, visit our Help Center at <a style=3D\"tex=",
                "\r\nt-decoration:none;color:#0074DE\" href=3D\"https://help.venmo.com\">help.venmo=",
                "\r\n.com</a>.</div><div style=3D\"margin-top:10px;\">This payment will be reviewe=",
                "\r\nd for compliance with our User Agreement and if we determine that there is =",
                "\r\na violation by either party, it may be reversed or your ability to transfer=",
                "\r\nto your bank account may be restricted.</div>",
                "\r\n    </div>",
                "\r\n",
                "\r\n</div>",
                "\r\n",
                "\r\n</div>",
                "\r\n",
                "\r\n                    =20",
                "\r\n                    </div>",
                "\r\n                    <div style=3D\"padding:10px 15px; color: #6B6E76; text-a=",
                "\r\nlign: center;\">",
                "\r\n                    =20",
                "\r\n                        <div style=3D\"color: #6B6E76; margin-top: 5px;\">",
                "\r\n                            Venmo is a service of PayPal, Inc., a licensed =",
                "\r\nprovider of money transfer services. All money transmission is provided by =",
                "\r\nPayPal, Inc. pursuant to <a href=3D\"https://venmo.com/legal/us-licenses/\" s=",
                "\r\ntyle=3D\"color:#0074DE; text-decoration:none\">PayPal, Inc.=E2=80=99s license=",
                "\r\ns</a>.",
                "\r\n                        </div>",
                "\r\n                    <p style=3D\"color: #6B6E76; margin-top: 14px;\">PayPal=",
                "\r\nis located at </p><p style=3D\"color: #6B6E76;\">2211 North First Street, Sa=",
                "\r\nn Jose, CA 95131</p>",
                "\r\n                        <div style=3D\"margin-top: 5px;\">",
                "\r\n                        =20",
                "\r\n                        =20",
                "\r\n                                <div style=3D\"font-size: smaller; margin-to=",
                "\r\np: 20px;\">For security reasons, you cannot unsubscribe from payment emails.=",
                "\r\n</div>",
                "\r\n                        =20",
                "\r\n                        </div>",
                "\r\n                    =20",
                "\r\n                    </div>",
                "\r\n                </div>",
                "\r\n            =20",
                "\r\n            =20",
                "\r\n            </div>",
                "\r\n        </div>",
                "\r\n    </body>",
                "\r\n</html>",
                "\r\n",
                "\r\n------=_Part_1305659_1567084644.1686119550918--",
            )
            .as_bytes();
            let email = parse_mail(message).unwrap();
            let logger = slog::Logger::root(slog::Discard, slog::o!());
            let signer = SignerBuilder::new()
                .with_signed_headers(&["From"])
                .unwrap()
                .with_private_key(private_key)
                .with_selector("default")
                .with_signing_domain("zkemail.com")
                .with_logger(&logger)
                .with_header_canonicalization(cfdkim::canonicalization::Type::Relaxed)
                .with_body_canonicalization(cfdkim::canonicalization::Type::Relaxed)
                .build()
                .unwrap();
            let signature = signer.sign(&email).unwrap();
            println!("signature {}", signature);
            let new_msg = vec![signature.as_bytes(), b"\r\n", message].concat();
            let (canonicalized_header, canonicalized_body, signature_bytes) = canonicalize_signed_email(&new_msg).unwrap();

            println!("canonicalized_header:\n{}", String::from_utf8(canonicalized_header.clone()).unwrap());
            println!("canonicalized_body:\n{}", String::from_utf8(canonicalized_body.clone()).unwrap());

            let e = RSAPubE::Fix(BigUint::from(DefaultEmailVerifyCircuit::<Fr>::DEFAULT_E));
            let n_big = BigUint::from_radix_le(&public_key.n().clone().to_radix_le(16), 16).unwrap();
            let public_key = RSAPublicKey::<Fr>::new(Value::known(BigUint::from(n_big)), e);
            let signature = RSASignature::<Fr>::new(Value::known(BigUint::from_bytes_be(&signature_bytes)));
            let circuit = DefaultEmailVerifyCircuit {
                header_bytes: canonicalized_header,
                body_bytes: canonicalized_body,
                public_key,
                signature,
            };

            let instances = circuit.instances();
            let prover = MockProver::run(params.degree, &circuit, instances).unwrap();
            assert_eq!(prover.verify(), Ok(()));
        });
    }
 
    #[cfg(feature = "dev-graph")]
    #[tokio::test]
    async fn test_existing_email3() {
        let regex_bodyhash_decomposed: DecomposedRegexConfig = serde_json::from_reader(File::open("./test_data/bodyhash_defs.json").unwrap()).unwrap();
        regex_bodyhash_decomposed
            .gen_regex_files(
                &Path::new("./test_data/bodyhash_allstr.txt").to_path_buf(),
                &[Path::new("./test_data/bodyhash_substr_0.txt").to_path_buf()],
            )
            .unwrap();
        let regex_timestamp_decomposed: DecomposedRegexConfig = serde_json::from_reader(File::open("./test_data/timestamp_defs.json").unwrap()).unwrap();
        regex_timestamp_decomposed
            .gen_regex_files(
                &Path::new("./test_data/timestamp_allstr.txt").to_path_buf(),
                &[Path::new("./test_data/timestamp_substr_0.txt").to_path_buf()],
            )
            .unwrap();
        let regex_body_decomposed: DecomposedRegexConfig = serde_json::from_reader(File::open("./test_data/test_ex3_email_body_defs.json").unwrap()).unwrap();
        regex_body_decomposed
            .gen_regex_files(
                &Path::new("./test_data/test_ex3_email_body_allstr.txt").to_path_buf(),
                &[
                    Path::new("./test_data/test_ex3_email_body_substr_0.txt").to_path_buf()
                ],
            )
            .unwrap();
        let email_bytes = {
            // NOTE: Download a Venmo payment received email into the build folder. We don't include it in the repo due to privacy reasons
            let mut f = File::open("./build/venmo_receive_payment.eml").unwrap();
            let mut buf = Vec::new();
            f.read_to_end(&mut buf).unwrap();
            buf
        };

        let logger = slog::Logger::root(slog::Discard, slog::o!());
        let public_key = resolve_public_key(&logger, &email_bytes).await.unwrap();
        let public_key = match public_key {
            cfdkim::DkimPublicKey::Rsa(pk) => pk,
            _ => panic!("not supportted public key type."),
        };
        temp_env::with_var(EMAIL_VERIFY_CONFIG_ENV, Some("./configs/test_ex3_email_verify.config"), move || {
            let params = DefaultEmailVerifyCircuit::<Fr>::read_config_params();
            let (canonicalized_header, canonicalized_body, signature_bytes) = canonicalize_signed_email(&email_bytes).unwrap();
            println!("header len\n {}", canonicalized_header.len());
            println!("body len\n {}", canonicalized_body.len());
            // println!("body\n{:?}", canonicalized_body);
            println!("canonicalized_header:\n{}", String::from_utf8(canonicalized_header.clone()).unwrap());
            println!("canonicalized_body:\n{}", String::from_utf8(canonicalized_body.clone()).unwrap());
            let e = RSAPubE::Fix(BigUint::from(DefaultEmailVerifyCircuit::<Fr>::DEFAULT_E));
            let n_big = BigUint::from_radix_le(&public_key.n().clone().to_radix_le(16), 16).unwrap();
            let public_key = RSAPublicKey::<Fr>::new(Value::known(BigUint::from(n_big)), e);
            let signature = RSASignature::<Fr>::new(Value::known(BigUint::from_bytes_be(&signature_bytes)));
            let circuit = DefaultEmailVerifyCircuit {
                header_bytes: canonicalized_header,
                body_bytes: canonicalized_body,
                public_key,
                signature,
            };

            // // Add plotting
            // use plotters::prelude::*;
            // // Plot layout
            // let root = BitMapBackend::new("layout.png", (2048, 2048)).into_drawing_area();
            // root.fill(&WHITE).unwrap();
            // let root = root.titled("Layout", ("sans-serif", 60)).unwrap();
            
            // halo2_base::halo2_proofs::dev::CircuitLayout::default()
            //     // The first argument is the size parameter for the circuit.
            //     .render((params.degree + 1) as u32, &circuit, &root)
            //     .unwrap();

            let instances = circuit.instances();
            let prover = MockProver::run(params.degree, &circuit, instances).unwrap();
            assert_eq!(prover.verify(), Ok(()));
        });
    }
}
