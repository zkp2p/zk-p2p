use halo2_base::halo2_proofs::plonk::{Circuit, Column, ConstraintSystem, Instance};
use halo2_base::halo2_proofs::{circuit::Layouter, plonk::Error};
use halo2_base::{
    gates::{flex_gate::FlexGateConfig, range::RangeConfig, GateInstructions, RangeInstructions},
    utils::PrimeField,
    Context,
};
use halo2_base::{AssignedValue, QuantumCell};
use halo2_dynamic_sha256::Sha256DynamicConfig;
use halo2_rsa::{AssignedRSAPublicKey, AssignedRSASignature, RSAConfig, RSAInstructions, RSAPubE, RSAPublicKey, RSASignature};

#[derive(Debug, Clone)]
pub struct SignVerifyConfig<F: PrimeField> {
    rsa_config: RSAConfig<F>,
}

impl<F: PrimeField> SignVerifyConfig<F> {
    pub fn configure(meta: &mut ConstraintSystem<F>, range_config: RangeConfig<F>, public_key_bits: usize) -> Self {
        let biguint_config = halo2_rsa::BigUintConfig::construct(range_config, 64);
        let rsa_config = RSAConfig::construct(biguint_config, public_key_bits, 5);
        Self { rsa_config }
    }

    pub fn assign_public_key<'v>(&self, ctx: &mut Context<'v, F>, public_key: RSAPublicKey<F>) -> Result<AssignedRSAPublicKey<'v, F>, Error> {
        self.rsa_config.assign_public_key(ctx, public_key)
    }

    pub fn assign_signature<'v>(&self, ctx: &mut Context<'v, F>, signature: RSASignature<F>) -> Result<AssignedRSASignature<'v, F>, Error> {
        self.rsa_config.assign_signature(ctx, signature)
    }

    pub fn verify_signature<'v: 'a, 'a>(
        &self,
        ctx: &mut Context<'v, F>,
        hash_bytes: &[AssignedValue<'v, F>],
        public_key: RSAPublicKey<F>,
        signature: RSASignature<F>,
    ) -> Result<(AssignedRSAPublicKey<'a, F>, AssignedRSASignature<'a, F>), Error> {
        let gate = self.rsa_config.gate();
        let mut hash_bytes = hash_bytes.to_vec();
        hash_bytes.reverse();
        let bytes_bits = hash_bytes.len() * 8;
        let limb_bits = self.rsa_config.biguint_config().limb_bits;
        let limb_bytes = limb_bits / 8;
        let mut hashed_u64s = vec![];
        let bases = (0..limb_bytes)
            .map(|i| F::from((1u64 << (8 * i)) as u64))
            .map(QuantumCell::Constant)
            .collect::<Vec<QuantumCell<F>>>();
        for i in 0..(bytes_bits / limb_bits) {
            let left = hash_bytes[limb_bytes * i..limb_bytes * (i + 1)]
                .iter()
                .map(QuantumCell::Existing)
                .collect::<Vec<QuantumCell<F>>>();
            let sum = gate.inner_product(ctx, left, bases.clone());
            hashed_u64s.push(sum);
        }
        let public_key = self.rsa_config.assign_public_key(ctx, public_key)?;
        let signature = self.rsa_config.assign_signature(ctx, signature)?;
        let is_sign_valid = self.rsa_config.verify_pkcs1v15_signature(ctx, &public_key, &hashed_u64s, &signature)?;
        gate.assert_is_const(ctx, &is_sign_valid, F::one());

        Ok((public_key, signature))
    }
}
