# circuits-circom

This folder contains the Circom circuits for ZKP2P

## Venmo Emails

Venmo uses the same HTML template for its send, receive, request completed sent and request completed received emails. 
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

> The protocol ONLY supports the SEND email type

## Circuits

### Venmo Send Email

Main circuit that onramper generates a proof of payment if offramper fails to generate proof above

1. Verifies the DKIM signature (RSA, SHA256)
2. Extracts from email, time of payment and amount for the Venmo transaction from the header
3. Extract the payee ID and payer ID from the body
4. Houses nullifier to prevent replay attacks
5. Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config       | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Offramper ID Regex | Extracts the Venmo payee ID from the payment sent email body to ensure the correct offramper is being paid    |
| Onramper ID Regex | Extracts the Venmo payer ID from the payment sent email body to ensure the correct onramper sent the payment. This is to prevent man-in-the-middle attacks if onramper email is revealed to a 3rd party   |
| Send Amount Regex       | Extracts $ amount sent from from venmo payment sent email header to ensure its a Send email type and amount is greater than requested |
| Timestamp Regex    | Extracts timestamp from venmo payment sent email header in order to ensure that email payment must be after on-chain intent timestamp |
| From Email Regex | Extracts `from` email in venmo payment received email header to ensure that it is sent from venmo@venmo.com and not another Venmo email |

### Venmo Registration
Main circuit that both onramper and offramper must generate a proof prior to using the protocol

1. Verifies the DKIM signature (RSA, SHA256)
2. Extracts from email and Venmo amount (restricts to a Send email type of the format: `You Paid $X to OFF_RAMPER_NAME`) from the header
3. Extracts actor ID (my Venmo ID) from the body
4. Houses nullifier to prevent replay attacks
5. Contains other order information to tie a proof to an order ID to prevent frontrunning

| Regex Config       | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Actor ID Regex     | Extracts the Venmo actor ID which is your email  |
| Send Amount Regex       | Extracts $ amount sent from from venmo payment sent email header to ensure its a Send email type and amount is greater than requested |
| From Email Regex | Extracts `from` email in venmo payment received email header to ensure that it is sent from venmo@venmo.com and not another Venmo email |

## Regexes

### Venmo Payee and Payer ID
The Venmo Payee ID regex is generated using [zk-regex](https://github.com/zkemail/zk-regex) which constrains ~330 bytes of HTML to prevent custom injection and index shifting attacks. Regex extracts 2 values: first one after `user_id=3D` and second one after `&actor_id=3D`

```json
{
  "parts": [
    {
      "is_public": false,
      "regex_def": "<!-- recipient name -->\r\n"
    },
    {
      "is_public": false,
      "regex_def": "                <a style=3D\"color:#0074DE; text-decoration:none\"\r\n"
    },
    {
      "is_public": false,
      "regex_def": "                   =20\r\n"
    },
    {
      "is_public": false,
      "regex_def": "                    href=3D\"https://venmo.com/code\\?user_id=3D"
    },
    {
      "is_public": true,
      "regex_def": "(0|1|2|3|4|5|6|7|8|9|\r|\n|=)+"
    },
    {
      "is_public": false,
      "regex_def": "&actor_id=3D"
    },
    {
      "is_public": true,
      "regex_def": "(0|1|2|3|4|5|6|7|8|9)+"
    },
    {
      "is_public": false,
      "regex_def": "\">\r\n"
    },
    {
      "is_public": false,
      "regex_def": "                   =20\r\n"
    },
    {
      "is_public": false,
      "regex_def": "                    [^\r\n]+\r\n"
    },
    {
      "is_public": false,
      "regex_def": "                </a>\r\n"
    },
    {
      "is_public": false,
      "regex_def": "               =20\r\n"
    },
    {
      "is_public": false,
      "regex_def": "            </div>\r\n"
    },
    {
      "is_public": false,
      "regex_def": "            <!-- note -->\r\n"
    }
  ]
}
```

### Venmo Actor ID Regex
The Venmo Actor ID regex is generated using [zk-regex](https://github.com/zkemail/zk-regex) which constrains ~330 bytes of HTML to prevent custom injection and index shifting attacks. Regex extracts after `actor_id=3D`. Notice that the regex is exactly the same as above, except the revealed regex string is different

```json
{
    "parts": [
      {
        "is_public": false,
        "regex_def": "<!-- recipient name -->\r\n"
      },
      {
        "is_public": false,
        "regex_def": "                <a style=3D\"color:#0074DE; text-decoration:none\"\r\n"
      },
      {
        "is_public": false,
        "regex_def": "                   =20\r\n"
      },
      {
        "is_public": false,
        "regex_def": "                    href=3D\"https://venmo.com/code\\?user_id=3D"
      },
      {
        "is_public": false,
        "regex_def": "(0|1|2|3|4|5|6|7|8|9|\r|\n|=)+&actor_id=3D"
      },
      {
        "is_public": true,
        "regex_def": "(0|1|2|3|4|5|6|7|8|9)+"
      },
      {
        "is_public": false,
        "regex_def": "\">\r\n                   =20\r\n"
      },
      {
        "is_public": false,
        "regex_def": "                    [^\r\n]+\r\n"
      },
      {
        "is_public": false,
        "regex_def": "                </a>\r\n"
      },
      {
        "is_public": false,
        "regex_def": "               =20\r\n"
      },
      {
        "is_public": false,
        "regex_def": "            </div>\r\n"
      },
      {
        "is_public": false,
        "regex_def": "            <!-- note -->\r\n"
      }
    ]
  }
```

### Venmo Send Amount
The Venmo Send Amount regex is generated using [zk-regex](https://github.com/zkemail/zk-regex) which constrains the entire subject line to prevent index shifting attacks. Regex extracts after `You paid `. Note that this regex limits the user to generate proofs using Send email types. For receive emails, the subject line will be `X paid you $Y`

```json
{
    "parts": [
        {
            "is_public": false,
            "regex_def": "((\r\n)|^)subject:You paid "
        },
        {
            "is_public": false,
            "regex_def": "[^\r\n]+\\$"
        },
        {
            "is_public": true,
            "regex_def": "(0|1|2|3|4|5|6|7|8|9|\\.|,)+"
        },
        {
            "is_public": false,
            "regex_def": "\r\n"
        }
    ]
}
```

| Regex Template | Description                                                                                                                  |
|----------------|------------------------------------------------------------------------------------------------------------------------------|
| VenmoPayeeID   | Extracts the Venmo payee ID and payer ID from Send email types                                                                |
| VenmoActorId   | Extracts the actor ID (my ID) from Send email types |
| VenmoSendAmount | Extracts the amount from a Send email type |
| VenmoTimestamp | Extracts the timestamp from Venmo emails |
| FromRegex | Extracts the from email (venmo@venmo.com) |

## Usage

### Generating Regexes

1. Go to [zk-regex](https://github.com/zkemail/zk-regex) and follow instructions

### Compilation

1. Create circuit.env `cp circuit.env.example circuit.env`
2. Run `yarn compile:TYPE` where `TYPE` is `send`, `receive`, `registration`. This will generate the R1CS SYM and WASM files.

### Generate witness

1. Copy a `SEND` eml file into `circuits-circom/emls` for a given email type. Venmo send emails have the subject line `You paid OFFRAMPER_NAME $X`. Make sure you are downloading the original email file. For example you can follow the following steps in [Gmail](https://support.google.com/mail/answer/29436?hl=en#zippy=%2Cgmail). Name your Venmo email `venmo_send.eml`.
2. In `circuits-circom` directory, run `yarn gen-input:TYPE` where `TYPE` is either `send`, `registration`. This will generate an input file with the name `input_EML_FILE_NAME.json`.
3. For development purposes, you only need to run up to this step

### Run tests
1. Inside the `circuits-circom` directory, first complete the `Compilation` and generate input steps above for all the circuits. Tests will use the `input_EML_FILE_NAME.json`, `.wasm`, and `.r1cs` files.
2. Run `yarn test`. This will generate witnesses in the `wtns` files prior to running tests.
3. Optionally, only run regex tests by running `yarn test test/regexes`

### Proving Key Generation

1. `cd` into `scripts` and run `cp entropy.env.example entropy.env`. Open the file and input your randomness. Entropy is needed to generate the proving key successfully
2. For production, run `yarn genkey:both:TYPE` which will generate both the chunked and nonchunked proving keys for the circuit
3. For dev, run `yarn genkey:chunked:unsafe` for chunked keys or `yarn genkey:non-chunked:unsafe`, which will skip phase2 contribution and save keygen time (DO NOT USE IN PRODUCTION)

### Generating Proofs

1. To generate proofs on your local machine, `cd` into `scripts` and run `CIRCUIT_NAME=YOUR_EMAIL_TYPE ./5_gen_proof.sh`
2. To generate proofs using RapidSnark serverside, run `yarn:genproof:TYPE`

## Security Assumptions
- Users do not share emails with each other. Treat your email like a private key
- Venmo does not change their email template drastically
- Admin has ability to update verification contracts over time
