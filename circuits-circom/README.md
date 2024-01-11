# circuits-circom

This folder contains the Circom circuits for ZKP2P.

## Usage

### Generating Regexes

1. Go to [zk-regex](https://github.com/zkemail/zk-regex) and follow instructions

In all the below commands, replace `$payment_type` with `venmo`, `hdfc`, or `paylah` and `$circuit_type` with `send` or `registration`. 
CD into `scripts` and run `cp .env.example .env`. Open the file and input your values.
CD into the circuit folder you want to develop and run the following commands.

### Compilation

1. Run `yarn compile:$payment_type:$circuit_type`. This will generate the R1CS SYM and WASM files.

### Generate witness

1. Copy a `SEND` eml file into `emls` for a given email type. Make sure you are downloading the original email file. For example you can follow the following steps in [Gmail](https://support.google.com/mail/answer/29436?hl=en#zippy=%2Cgmail). Name your Venmo email `${payment_type}_send.eml`.
2. Run `yarn gen-input:$payment_type:$circuit_type`. This will generate an input file with the name `input_$payment_type_$circuit_type.json`.

### Run tests

1. Run `yarn test:$payment_type:$circuit_type`.
2. Optionally, only run regex tests by running `yarn test test/regexes`
3. For development purposes, you only need to run up to this step.

### Proving Key Generation

1. `cd` into `scripts` and run `cp entropy.env.example entropy.env`. Open the file and input your randomness. Entropy is needed to generate the proving key successfully
2. cd back into circuit folder and run `yarn genkey:non-chunked:unsafe:$payment_type:$circuit_type`, which will generate keys skipping phase2 contribution and save keygen time (DO NOT USE IN PRODUCTION)

### Generating Proofs

1. cd into `scripts` and update `circuit.env.`
2. To generate proofs using RapidSnark run `yarn:genproof:$payment_type:$circuit_type`