# circuits-circom

This folder contains the Circom circuits for ZKP2P

## Circuits

### Venmo Receive Email

### Venmo Send Email

## Usage

### Compilation
1. Create circuit.env `cp circuit.env.example circuit.env` 
2. Edit circuit.env to point to the correct paths
3. `cd` into `scripts` and run `./1_compile.sh`. This will generate the R1CS SYM and WASM files

### Generate witness
1. In `circuits-circom` directory, run `yarn gen-inputs EML_FILE_NAME EMAIL_TYPE` where EML_FILE_NAME is the name of the eml file in `circuits-circom/emls` and EMAIL_TYPE is the type of the email. This will generate an input file with the name `input_EML_FILE_NAME.json`. Example: `yarn gen-inputs venmo_receive EMAIL_VENMO_RECEIVE`
2. `cd` into `scripts` and run `./2_gen_witness.sh` which will generate the witness needed to generate the proof
3. For development purposes, you only need to run up to this step

### Proving Key Generation
1. `cd` into `scripts` and run `cp entropy.env.example entropy.env`. Entropy is needed to generate the proving key successfully
2. Run `./3_gen_both_zkeys.sh` which will generate the proving key for the circuit

### Generating Proofs
1. To generate proofs on your local machine, `cd` into `scripts` and run `./5_gen_proof.sh`
2. To generate proofs using RapidSnark serverside, `cd` into `scripts` and run `./6_gen_proof_rapidsnark.sh`