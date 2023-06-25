# halo2-zk-email

**Email verification circuit in halo2.** Documentation coming soon.

## Disclaimer
DO NOT USE THIS LIBRARY IN PRODUCTION. At this point, this is under development not audited. It has known and unknown bugs and security flaws.

## Features
`halo2-zk-email` provides a library and a command-line interface for an email verification circuit compatible with the [halo2 library developed by privacy-scaling-explorations team](https://github.com/privacy-scaling-explorations/halo2).

## Requirement
- rustc 1.68.0-nightly (0468a00ae 2022-12-17)
- cargo 1.68.0-nightly (cc0a32087 2022-12-14)
- solc 0.8.19+commit.7dd6d404

Install solc (Mac instructions):
```bash
brew tap ethereum/ethereum
brew install solidity
```

## Installation and Build
You can install and build our library with the following commands.
```bash
git clone https://github.com/zkemail/halo2-zk-email.git
cd halo2-zk-email
cargo build --release
```

## Description
To generate a sample circuit and it's non aggregated EVM verifier, do:
```bash
cargo build --release
cargo run --release -- gen-params --k 18
cargo run --release -- gen-app-key
cargo run --release -- gen-evm-verifier
cargo run --release -- evm-verify-app
```
