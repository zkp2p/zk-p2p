# ZKP2P Halo2 Circuits

**Forked from [Halo2 ZK Email](https://github.com/zkemail/halo2-zk-email)**

## Disclaimer
THIS REPO IS UNDER HEAVY DEVELOPMENT, DO NOT USE IN PRODUCTION. At this point, this is under development not audited. It has known and unknown bugs and security flaws.

## Overview
The ZKP2P halo2 circuits generate proofs of email for P2P payment networks. We have implemented the following circuits:

**Halo2 Circuit - Offramper Receive Payment Circuit**
Main circuit that offramper generates a proof of Venmo payment received email
1. Verifies the DKIM signature (RSA, SHA256)
2. Extracts Venmo payer ID, time of payment from email
3. Houses nullifier to prevent replay attacks
4. Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config | Description |
| -------- | -------- |
| Onramper Regex | Extracts the Venmo payer ID from the payment received email body |
| Timestamp Regex | Extracts timestamp from venmo payment received email header |

## Requirement
- rustc 1.68.0-nightly (0468a00ae 2022-12-17)
- cargo 1.68.0-nightly (cc0a32087 2022-12-14)
- solc 0.8.19+commit.7dd6d404

Install solc (Mac instructions):
```bash
brew tap ethereum/ethereum
brew install solidity
```

## Description
To generate any ZKP2P circuits and it's non aggregated EVM verifier:
```bash
cargo build --release
cargo run --release -- gen-params --k 18
cargo run --release -- gen-app-key
cargo run --release -- gen-evm-verifier
cargo run --release -- evm-verify-app
```
