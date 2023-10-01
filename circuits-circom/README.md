# circuits-circom

This folder contains the Circom circuits for ZKP2P

## Venmo Emails

Venmo uses the same HTML template for it's send, receive, request completed sent and request completed received emails. 
Although each email has different Venmo IDs, at the 4 spaces in the HTML template.


The HTML template:
```html
                <!-- actor name -->
                <a style=3D"color:#0074DE; text-decoration:none" href=3D"ht=
tps://venmo.com/code?user_id=3D<VENMO_ID_1>&actor_id=3D<EMAIL_RECEIVER_VENMO_ID>=
xxxxxx">
                    You
                </a>
                <!-- action -->
                <span>
                    paid
                </span>
              =20
                <!-- recipient name -->
                <a style=3D"color:#0074DE; text-decoration:none"
                   =20
                    href=3D"https://venmo.com/code?user_id=3D<VENMO_ID_2>=
xxxxx&actor_id=3D<EMAIL_RECEIVER_VENMO_ID>">
                   =20
                    Receiver's name
                </a>
```


| Email | VENMO_ID_1 | VENMO_ID_2 |
| ----- | ---------- | ---------- |
| Venmo Send | Sender/Payer Venmo ID  | Receiver/Payee Venmo ID |
| Venmo Receive | Sender/Payer Venmo ID  | Receiver/Payee Venmo ID |
| Venmo Request Completed Send | Receiver/Payee Venmo ID  | Sender/Payer Venmo ID |
| Venmo Request Completed Receive | Receiver/Payee Venmo ID  | Sender/Payer Venmo ID |

To prevent users from using request complete emails to generate proofs, we must ensure that the email is a send or receive email using appropriate regexes.

## Circuits

### Venmo Receive Email

Main circuit that offramper generates a proof of Venmo payment received email

1. Verifies the DKIM signature (RSA, SHA256)
2. Extracts Venmo payer ID, time of payment from email
3. Extract from email
4. Houses nullifier to prevent replay attacks
5. Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config    | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| Onramper Regex  | Extracts the Venmo payer ID from the payment received email body |
| Timestamp Regex | Extracts timestamp from venmo payment received email header      |
| From Email Regex | Extracts `from` email in venmo payment received email header to ensure that it is sent from venmo@venmo.com and not another Venmo email |

### Venmo Send Email

Main circuit that onramper generates a proof of payment if offramper fails to generate proof above

1. Verifies the DKIM signature (RSA, SHA256)
2. Extracts payee ID and amount for the Venmo transaction
3. Extract from email
4. Houses nullifier to prevent replay attacks
5. Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config       | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Offramper ID Regex | Extracts the Venmo payee ID from the payment sent email body     |
| Amount Regex       | Extracts $ amount sent from from venmo payment sent email header |
| From Email Regex | Extracts `from` email in venmo payment received email header to ensure that it is sent from venmo@venmo.com and not another Venmo email |

### Venmo Registration
Main circuit that both onramper and offramper must generate a proof prior to using the protocol

1. Verifies the DKIM signature (RSA, SHA256)
2. Extracts actor ID
3. Extracts from email
4. Houses nullifier to prevent replay attacks
5. Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config       | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Actor ID Regex | Extracts the Venmo actor ID which is the same for the 3 Venmo payment confirmation emails (send, receive,complete payment). NOTE: request payment is excluded from the list because regex is different (and less sybil resistant due to not needing to complete a payment to generate this email)  |
| From Email Regex | Extracts `from` email in venmo payment received email header to ensure that it is sent from venmo@venmo.com and not another Venmo email |

## Regexes

### Venmo

Both the Venmo send and receive email have the same HTML structure. 
They both contain the Venmo payer ID and the payee ID. Hence we have abstracted the regexes into their own templates.

| Regex Template | Regex                                                                                           | Description                                                                                                                  |
|----------------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| VenmoPayerID   | `\r\ntps://venmo.com/code\\?user_id=3D(0\|1\|2\|3\|4\|5\|6\|7\|8\|9)+`                         | Extracts the Venmo payer ID from both send and receive emails                                                                |
| VenmoPayeeID   | `href=3D\"https://venmo.com/code\\?user_id=3D(0\|1\|2\|3\|4\|5\|6\|7\|8\|9\|\r\|\n\|=)+`       | Extracts the Venmo payee ID from both send and receive emails                                                                |
| VenmoActorId   | `&actor_id=3D(0\|1\|2\|3\|4\|5\|6\|7\|8\|9)+">/r/n`                                           | Extracts the actor ID (my ID) from payment sent, payment received and payment request completed received emails |

Circuits that use the Venmo regexes:

| Circuit Name | Regex Template | Description |
| ------------ | -------------- | ----------- |
| VenmoSend    | VenmoPayeeID   | Extracts the Venmo payee ID from the payment sent email body |
| VenmoReceive | VenmoPayerID   | Extracts the Venmo payer ID from the payment received email body |
| VenmoRegistration | VenmoActorID   | Extracts the actor ID (my ID) from payment sent, payment received and payment request completed received emails |

## Usage

### Generating Regexes

1. `cd` into `regex_to_circom`
2. Update `regex_to_dfa.js` with the regex or raw regex string. To validate if the regex is run correctly, you can use [ZK Regex UI](https://frontend-zk-regex.vercel.app/)
3. Run `python3 gen.py` to generate the Circom template
4. Copy the output into a circom regex file

### Compilation

1. Create circuit.env `cp circuit.env.example circuit.env`
2. Run `yarn compile:TYPE` where `TYPE` is `send`, `receive`, `registration`. This will generate the R1CS SYM and WASM files.

### Generate witness

1. Copy an eml file into `circuits-circom/emls` for a given email type. Venmo send and receive emails are different. Make sure you are downloading the original email file. For example you can follow the following steps in [Gmail](https://support.google.com/mail/answer/29436?hl=en#zippy=%2Cgmail). Name your Venmo receive email `venmo_receive.eml` and Venmo send email `venmo_send.eml`.
2. In `circuits-circom` directory, run `yarn gen-input:TYPE` where `TYPE` is either `send`, `receive` or one of three registration emails. This will generate an input file with the name `input_EML_FILE_NAME.json`.
  a. NOTE: for registration, all 3 types of Venmo emails above work: `reg-complete` (registration using a Complete Payment email), `reg-send` (registration using a Send Payment email), `reg-receive` (registration using a Receive Payment email). 
3. For development purposes, you only need to run up to this step

### Run tests
1. Inside the `circuits-circom` directory, first complete the `Compilation` and generate input steps above for all the circuits. Tests will use the `input_EML_FILE_NAME.json`, `.wasm`, and `.r1cs` files.
2. Run `yarn test`. This will generate witnesses in the `wtns` files prior to running tests.

### Proving Key Generation

1. `cd` into `scripts` and run `cp entropy.env.example entropy.env`. Open the file and input your randomness. Entropy is needed to generate the proving key successfully
2. For production, run `yarn genkey:both:TYPE` which will generate both the chunked and nonchunked proving keys for the circuit
3. For dev, run `yarn genkey:chunked:unsafe` for chunked keys or `yarn genkey:non-chunked:unsafe`, which will skip phase2 contribution and save keygen time (DO NOT USE IN PRODUCTION)

### Generating Proofs

1. To generate proofs on your local machine, `cd` into `scripts` and run `CIRCUIT_NAME=YOUR_EMAIL_TYPE ./5_gen_proof.sh`
2. To generate proofs using RapidSnark serverside, `cd` into `scripts` and run `yarn:genproof:TYPE`
