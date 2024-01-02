import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";
import { buildPoseidonOpt as buildPoseidon, buildMimcSponge, poseidonContract } from "circomlibjs";
import { chunkArray, bytesToPacked, packNullifier, hashSignatureGenRand } from "./utils";
import { ethers } from "ethers";
import ganache from "ganache";
import { partialSha } from "@zk-email/helpers/src/shaHash";

const { createCode, generateABI } = poseidonContract;
export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

// Constants used in the circuit
const N = 121;
const K = 17;

describe("Paylah send WASM tester", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;
    let poseidonContract1;
    let poseidonContract2;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../paylah_send.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/paylah_send"),
                recompile: false, // setting this to true will recompile the circuit (~3-5min)
                verbose: true,
            }
        );

        poseidon = await buildPoseidon();
        mimcSponge = await buildMimcSponge();
    });

    it("Should generate witnesses", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should return the correct modulus hash", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_receive.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo receive payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned modulus hash
        const modulus_hash = witness[1];

        // Get expected modulus hash
        const expected_hash = mimcSponge.multiHash(input["modulus"], 123, 1);

        assert.equal(JSON.stringify(mimcSponge.F.e(modulus_hash)), JSON.stringify(expected_hash), true);
    });

    it("Should return the correct packed from email", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed from email
        // Indexes 2 to 5 represent the packed from email (15 \ 7)
        const packed_from_email = witness.slice(2, 5);

        // Get expected packed from email
        const regex_start = Number(input["email_from_idx"]);
        const regex_start_sub_array = input["in_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("62"); // Look for `>` to end the from which is 62 in ascii. e.g. `from:<venmo@venmo.com>`
        const from_email_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(from_email_array, 7, 20);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed email is the same
            assert.equal(expectedValue, packed_from_email[i], true);
        });
    });

    it("Should return the correct packed timestamp", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed timestamp
        const packed_timestamp = witness.slice(5, 7);

        // Get expected packed timestamp
        const regex_start = Number(input["email_timestamp_idx"]);
        const regex_start_sub_array = input["in_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("59"); // Look for `;` to end the timestamp which is 59 in ascii
        const timestamp_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(timestamp_array, 7, 10);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed timestamp is the same
            assert.equal(expectedValue, packed_timestamp[i], true);
        });
    });

    // There's probably a diff on how the packing happens on contract / circuit vs how we do it here.
    it("Should return the correct packed amount", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed amount
        // Indexes 5 to 7 represent the packed amount (8 \ 7)
        const packed_amount = witness.slice(7, 8);

        // Get expected packed amount
        const regex_start = Number(input["paylah_amount_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("60"); // Look for `<` to end the amount which is 60 in ascii
        const amount_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(amount_array, 7, 7);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed amount is the same
            assert.equal(expectedValue, packed_amount[i], true);
        });
    });

    it("should return the correct hashed onramper id", async () => {
        const provider = new ethers.providers.Web3Provider(
            ganache.provider({
                logging: {
                    logger: {
                        log: () => { } // Turn off logging
                    }
                }
            })
        );
        account = provider.getSigner(0);
        const C6 = new ethers.ContractFactory(
            generateABI(6),
            createCode(6),
            account
        );
        const C3 = new ethers.ContractFactory(
            generateABI(3),
            createCode(3),
            account
        );

        poseidonContract1 = await C6.deploy();
        poseidonContract2 = await C3.deploy();

        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed onramper id
        const hashed_onramper_id = witness[8];

        // Get expected packed to email
        const regex_start_to_email = Number(input["email_to_idx"]);
        const regex_start_sub_array_to_email = input["in_padded"].slice(regex_start_to_email);
        const regex_end_to_email = regex_start_sub_array_to_email.indexOf("13"); // Look for `\r` to end the from which is 13 in ascii. e.g. `to:0xAnonKumar@gmail.com`
        const to_email_array = regex_start_sub_array_to_email.slice(0, regex_end_to_email);

        // Get expected packed account number array
        const regex_start_mobile_number = Number(input["paylah_payer_mobile_num_idx"]);
        const regex_start_sub_array_mobile_number = input["in_body_padded"].slice(regex_start_mobile_number);
        const regex_end_mobile_number = regex_start_sub_array_mobile_number.indexOf("41"); // Look for `)` to end the from which is 41 in ascii.
        const mobile_number_array = regex_start_sub_array_mobile_number.slice(0, regex_end_mobile_number);

        // Chunk bytes into 7 and pack
        const toEmailChunkedArray = chunkArray(to_email_array, 7, 49);
        const packed_to_email_array = toEmailChunkedArray.map((arr, i) => bytesToPacked(arr));

        const mobileNumberChunkedArray = chunkArray(mobile_number_array, 7, 7);
        const packed_mobile_number_array = mobileNumberChunkedArray.map((arr, i) => bytesToPacked(arr));

        // ARE WE REALLY LIMITED BY THIS? DO WE NEED TO HASH ON THE CONTRACT?
        const combinedArray = packed_to_email_array.concat(packed_mobile_number_array)
        const expected_hash = poseidon([poseidon(combinedArray.slice(0, 6))].concat(combinedArray.slice(6, 8)))
        const temp_contract_hash_out = await poseidonContract1["poseidon(uint256[6])"](combinedArray.slice(0, 6));
        const expected_hash_contract = await poseidonContract2["poseidon(uint256[3])"]([temp_contract_hash_out].concat(combinedArray.slice(6, 8)));

        assert.equal(JSON.stringify(poseidon.F.e(hashed_onramper_id)), JSON.stringify(expected_hash), true);
        assert.equal(JSON.stringify(poseidon.F.e(hashed_onramper_id)), JSON.stringify(poseidon.F.e(expected_hash_contract.toString())), true);
    });

    it("Should return the correct hashed offramper id", async () => {
        const provider = new ethers.providers.Web3Provider(
            ganache.provider({
                logging: {
                    logger: {
                        log: () => { } // Turn off logging
                    }
                }
            })
        );
        account = provider.getSigner(0);
        const C6 = new ethers.ContractFactory(
            generateABI(6),
            createCode(6),
            account
        );
        poseidonContract1 = await C6.deploy();

        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed offramper_id
        const hashed_offramper_id = witness[9];

        // Get expected packed offramper_id
        const regex_start = Number(input["paylah_payee_name_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("40");  // Look for `(` to end the offramper name which is 40 in ascii
        const offramper_name_array = regex_start_sub_array.slice(0, regex_end);

        // Get expected packed phone number array
        const regex_start_mobile_number = Number(input["paylah_payee_mobile_num_idx"]);
        const regex_start_sub_array_mobile_number = input["in_body_padded"].slice(regex_start_mobile_number);
        const regex_end_mobile_number = regex_start_sub_array_mobile_number.indexOf("41"); // Look for `)` to end the from which is 41 in ascii.
        const mobile_number_array = regex_start_sub_array_mobile_number.slice(0, regex_end_mobile_number);

        // Chunk bytes into 7 and pack
        const toEmailChunkedArray = chunkArray(offramper_name_array, 7, 35);
        const packed_offramper_name_array = toEmailChunkedArray.map((arr, i) => bytesToPacked(arr));

        const mobileNumberChunkedArray = chunkArray(mobile_number_array, 7, 7);
        const packed_mobile_number_array = mobileNumberChunkedArray.map((arr, i) => bytesToPacked(arr));

        const combinedArray = packed_offramper_name_array.concat(packed_mobile_number_array)
        const expected_hash = poseidon(combinedArray)
        const expected_hash_contract = await poseidonContract1["poseidon(uint256[6])"](combinedArray);

        assert.equal(JSON.stringify(poseidon.F.e(hashed_offramper_id)), JSON.stringify(expected_hash), true);
        assert.equal(JSON.stringify(poseidon.F.e(hashed_offramper_id)), JSON.stringify(poseidon.F.e(expected_hash_contract.toString())), true);
    });

    it("Should return the correct payment ID nullifier", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned nullifier
        const nullifier = witness[10];

        // Get expected packed offramper_id
        const regex_start = Number(input["paylah_payment_id_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("60");  // Look for `<` to end the payment_id which is 46 in ascii
        const payment_id_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        const chunkedArrays = chunkArray(payment_id_array, 7, 28);
        const packed_payment_id = chunkedArrays.map((arr, i) => bytesToPacked(arr));

        const expected_nullifier = poseidon(packed_payment_id)
        assert.equal(JSON.stringify(poseidon.F.e(nullifier)), JSON.stringify(expected_nullifier), true);
    });

    it("Should return the correct intent hash", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_paylah_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned modulus
        const intent_hash = witness[11];

        // Get expected modulus
        const expected_intent_hash = input["intent_hash"];

        assert.equal(JSON.stringify(intent_hash), JSON.stringify(expected_intent_hash), true);
    });
});