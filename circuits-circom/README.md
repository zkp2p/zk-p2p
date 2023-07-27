# circuits-circom

This folder contains the Circom circuits for ZKP2P

## Circuits

### Venmo Receive Email
Main circuit that offramper generates a proof of Venmo payment received email
- Verifies the DKIM signature (RSA, SHA256)
- Extracts Venmo payer ID, time of payment from email
- Houses nullifier to prevent replay attacks
- Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config | Description |
| -------- | -------- |
| Onramper Regex | Extracts the Venmo payer ID from the payment received email body |
| Timestamp Regex | Extracts timestamp from venmo payment received email header |

### Venmo Send Email
Main circuit that onramper generates a proof of payment if offramper fails to generate proof above
1. Verifies the DKIM signature (RSA, SHA256)
2. Extracts payee ID and amount for the Venmo transaction
3. Houses nullifier to prevent replay attacks
4. Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config | Description |
| -------- | -------- |
| Offramper ID Regex | Extracts the Venmo payee ID from the payment sent email body |
| Amount Regex | Extracts $ amount sent from from venmo payment sent email header |

## Usage

### Generating Regexes
1. `cd` into `regex_to_circom`
2. Update `regex_to_dfa.js` with the regex or raw regex string. To validate if the regex is run correctly, you can use [ZK Regex UI](https://frontend-zk-regex.vercel.app/)
3. Run `python3 gen.py` to generate the Circom template
4. Copy the output into a circom regex file

### Compilation
1. Create circuit.env `cp circuit.env.example circuit.env` 
2. Edit circuit.env to point to the correct paths. Example:
```
CIRCUIT_NAME=venmo_receive
BUILD_DIR="../build/$CIRCUIT_NAME"
PTAU_DIR="../.."
PTAU=23
RAPIDSNARK_PATH="./../../rapidsnark/build/prover"
```
3. `cd` into `scripts` and run `./1_compile.sh`. This will generate the R1CS SYM and WASM files

### Generate witness
1. Copy an eml file into `circuits-circom/emls` for a given email type. Venmo send and receive emails are different. Make sure you are downloading the original email file. For example you can follow the following steps in [Gmail](https://support.google.com/mail/answer/29436?hl=en#zippy=%2Cgmail). Name your Venmo receive email `venmo_receive.eml` and Venmo send email `venmo_send.eml`. 
1. In `circuits-circom` directory, run `yarn gen-inputs EML_FILE_NAME EMAIL_TYPE` where EML_FILE_NAME is the name of the eml file in `circuits-circom/emls` and EMAIL_TYPE is the type of the email. This will generate an input file with the name `input_EML_FILE_NAME.json`. Example: `yarn gen-inputs venmo_receive EMAIL_VENMO_RECEIVE`
2. `cd` into `scripts` and run `./2_gen_witness.sh` which will generate the witness needed to generate the proof
3. For development purposes, you only need to run up to this step

### Proving Key Generation
1. `cd` into `scripts` and run `cp entropy.env.example entropy.env`. Entropy is needed to generate the proving key successfully
2. Run `./3_gen_both_zkeys.sh` which will generate the proving key for the circuit

### Generating Proofs
1. To generate proofs on your local machine, `cd` into `scripts` and run `./5_gen_proof.sh`
2. To generate proofs using RapidSnark serverside, `cd` into `scripts` and run `./6_gen_proof_rapidsnark.sh`