use criterion::{black_box, criterion_group, criterion_main, Criterion};
use halo2_base::halo2_proofs::halo2curves::bn256::{Bn256, Fr, G1Affine};
use halo2_base::halo2_proofs::poly::{commitment::Params, kzg::commitment::ParamsKZG};
use halo2_base::{gates::range::RangeConfig, utils::PrimeField, Context};
use halo2_zk_email::DefaultEmailVerifyCircuit;
use halo2_zk_email::{downsize_params, evm_prove_agg, gen_agg_key, gen_app_key, gen_params, EMAIL_VERIFY_CONFIG_ENV};
use sha2::{self, Digest, Sha256};
use snark_verifier_sdk::halo2::{aggregation::AggregationCircuit, gen_proof_shplonk, gen_snark_shplonk};
use std::env::set_var;
use std::{
    fs::File,
    io::{prelude::*, BufReader, BufWriter},
    path::Path,
};
use tokio::runtime::Runtime;

fn gen_or_get_params(path: &str, k: u32) -> ParamsKZG<Bn256> {
    if !Path::new(&path).is_file() {
        gen_params(&path, k).unwrap();
    }
    let mut reader = BufReader::new(File::open(&path).unwrap());
    ParamsKZG::read(&mut reader).unwrap()
}

// fn gen_or_get_pk1(agg_params: &ParamsKZG<Bn256>, snarks: &[Snark]) -> ProvingKey<G1Affine> {
//     let path = "proving_key_1.pk";
//     match File::open(&path) {
//         Ok(f) => {
//             let mut reader = BufReader::new(f);
//             ProvingKey::<G1Affine>::read::<_, AggregationCircuit>(
//                 &mut reader,
//                 SerdeFormat::RawBytes,
//             )
//             .unwrap()
//         }
//         Err(_) => {
//             let agg_pk = gen_bench1_agg_pk(&agg_params, snarks.to_vec(), &mut OsRng);
//             agg_pk
//                 .write(
//                     &mut BufWriter::new(File::create(&path).unwrap()),
//                     SerdeFormat::RawBytes,
//                 )
//                 .unwrap();
//             agg_pk
//         }
//     }
// }

const AGG_PARAMS_K: u32 = 22;
const APP_CONFIG_PATH: &'static str = "./configs/app_recursion_bench.config";
const AGG_CONFIG_PATH: &'static str = "./configs/agg_bench.config";

fn bench_email_verify_recursion1(c: &mut Criterion) {
    let mut group = c.benchmark_group("email bench1 with recursion");
    group.sample_size(10);
    set_var(EMAIL_VERIFY_CONFIG_ENV, APP_CONFIG_PATH);
    let app_config_params = DefaultEmailVerifyCircuit::<Fr>::read_config_params();
    let agg_params_path = format!("benches/params_{}.bin", AGG_PARAMS_K);
    let app_params_path = format!("benches/params_{}.bin", app_config_params.degree);
    gen_or_get_params(&agg_params_path, AGG_PARAMS_K);
    downsize_params(&agg_params_path, &app_params_path, app_config_params.degree).unwrap();
    println!("gen_params");
    let runtime = Runtime::new().unwrap();
    runtime.block_on(async {
        let (circuit, _, _, _, _) = DefaultEmailVerifyCircuit::<Fr>::gen_circuit_from_email_path("test_data/test_email1.eml").await;
        gen_app_key(&app_params_path, APP_CONFIG_PATH, "benches/app.pk", "benches/app.vk", circuit).await.unwrap()
    });
    runtime.block_on(async {
        let (circuit, _, _, _, _) = DefaultEmailVerifyCircuit::<Fr>::gen_circuit_from_email_path("test_data/test_email1.eml").await;
        gen_agg_key(
            &app_params_path,
            &agg_params_path,
            APP_CONFIG_PATH,
            AGG_CONFIG_PATH,
            "benches/app.pk",
            "benches/agg.pk",
            "benches/app.vk",
            circuit,
        )
        .await
        .unwrap()
    });

    // runtime.block_on(async {
    //     evm_prove_agg(
    //         &app_params_path,
    //         &agg_params_path,
    //         APP_CONFIG_PATH,
    //         AGG_CONFIG_PATH,
    //         "test_data/test_email1.eml",
    //         "benches/app.pk",
    //         "benches/agg.pk",
    //         "benches/acc.hex",
    //         "benches/proof.hex",
    //         "benches/public_input.json",
    //     )
    //     .await
    //     .unwrap();
    // });
    // set_var(EMAIL_VERIFY_CONFIG_ENV, "./configs/bench_agg_email_verify.config");
    // let config_params = DefaultEmailVerifyCircuit::<Fr>::read_config_params();
    // let mut rng = thread_rng();
    // let _private_key = RsaPrivateKey::new(&mut rng, config_params.public_key_bits).expect("failed to generate a key");
    // let public_key = rsa::RsaPublicKey::from(&_private_key);
    // let private_key = cfdkim::DkimPrivateKey::Rsa(_private_key);
    // let message = concat!("From: alice@zkemail.com\r\n", "\r\n", "email was meant for @zkemailverify.",).as_bytes();
    // let email = parse_mail(message).unwrap();
    // let logger = slog::Logger::root(slog::Discard, slog::o!());
    // let signer = SignerBuilder::new()
    //     .with_signed_headers(&["From"])
    //     .unwrap()
    //     .with_private_key(private_key)
    //     .with_selector("default")
    //     .with_signing_domain("zkemail.com")
    //     .with_logger(&logger)
    //     .with_header_canonicalization(cfdkim::canonicalization::Type::Relaxed)
    //     .with_body_canonicalization(cfdkim::canonicalization::Type::Relaxed)
    //     .build()
    //     .unwrap();
    // let signature = signer.sign(&email).unwrap();
    // println!("signature {}", signature);
    // let new_msg = vec![signature.as_bytes(), b"\r\n", message].concat();
    // let (canonicalized_header, canonicalized_body, signature_bytes) = canonicalize_signed_email(&new_msg).unwrap();

    // let e = RSAPubE::Fix(BigUint::from(DefaultEmailVerifyCircuit::<Fr>::DEFAULT_E));
    // let n_big = BigUint::from_radix_le(&public_key.n().clone().to_radix_le(16), 16).unwrap();
    // let public_key = RSAPublicKey::<Fr>::new(Value::known(BigUint::from(n_big)), e);
    // let signature = RSASignature::<Fr>::new(Value::known(BigUint::from_bytes_be(&signature_bytes)));
    // let circuit = DefaultEmailVerifyCircuit {
    //     header_bytes: canonicalized_header,
    //     body_bytes: canonicalized_body,
    //     public_key,
    //     signature,
    // };
    // let emp_circuit = circuit.without_witnesses();
    // let (pks, _) = gen_multi_layer_proving_keys(
    //     &app_params,
    //     Some(&params),
    //     Some(&params),
    //     "./configs/app_to_agg.config",
    //     "./configs/agg_to_agg.config",
    //     &emp_circuit,
    //     2,
    // );
    // let circuits = vec![circuit; 4];
    group.bench_function("bench 1", |b| {
        b.iter(|| {
            runtime.block_on(async {
                let (circuit, _, _, _, _) = DefaultEmailVerifyCircuit::<Fr>::gen_circuit_from_email_path("test_data/test_email1.eml").await;
                evm_prove_agg(
                    &app_params_path,
                    &agg_params_path,
                    APP_CONFIG_PATH,
                    AGG_CONFIG_PATH,
                    "benches/app.pk",
                    "benches/agg.pk",
                    "benches/acc.hex",
                    "benches/proof.hex",
                    circuit,
                )
                .await
                .unwrap();
            })
        })
    });
    group.finish();
}

criterion_group!(benches, bench_email_verify_recursion1,);
criterion_main!(benches);
