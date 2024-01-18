import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";
import { buildPoseidonOpt as buildPoseidon, buildMimcSponge, poseidonContract } from "circomlibjs";
import { chunkArray, bytesToPacked, chunkedBytesToBigInt } from "../../utils/test-utils";
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

describe("Garanti send WASM tester", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;
    let poseidonContract1;
    let poseidonContract2;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../garanti_send.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/garanti_send"),
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
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
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
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
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
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed from email
        // Indexes 2 to 5 represent the packed from email (31 \ 7)
        const packed_from_email = witness.slice(2, 7);

        // Get expected packed from email
        const regex_start = Number(input["email_from_idx"]);
        const regex_start_sub_array = input["in_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("62"); // Look for `>` to end the from which is 62 in ascii. e.g. `from:<venmo@venmo.com>`
        const from_email_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(from_email_array, 7, 31);

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
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed timestamp
        const packed_timestamp = witness.slice(7, 9);

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

    it("should return the correct packed payee account number", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed amount
        // Indexes 5 to 7 represent the packed amount (8 \ 7)
        const packed_amount = witness.slice(9, 14);

        // Get expected packed amount
        const regex_start = Number(input["garanti_payee_acc_num_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("60"); // Look for `<` to end the amount which is 60 in ascii
        const amount_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(amount_array, 7, 32);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed amount is the same
            assert.equal(expectedValue, packed_amount[i], true);
        });

    });

    it("Should return the correct packed amount", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed amount
        // Indexes 14 to 16 represent the packed amount (8 \ 7)
        const packed_amount = witness.slice(14, 16);

        // Get expected packed amount
        const regex_start = Number(input["garanti_amount_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("32"); // Look for ` ` to end the amount which is 32 in ascii
        const amount_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(amount_array, 7, 8);

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

        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed onramper id
        const hashed_onramper_id = witness[16];

        // Get expected packed to email
        const regex_start_to_email = Number(input["email_to_idx"]);
        const regex_start_sub_array_to_email = input["in_padded"].slice(regex_start_to_email);
        const regex_end_to_email = regex_start_sub_array_to_email.indexOf("13"); // Look for `\r` to end the from which is 13 in ascii. e.g. `to:0xAnonKumar@gmail.com`
        const to_email_array = regex_start_sub_array_to_email.slice(0, regex_end_to_email);

        // Get expected packed payer name array
        const regex_start_payer_name = Number(input["garanti_payer_name_idx"]);
        const regex_start_sub_array_payer_name = input["in_body_padded"].slice(regex_start_payer_name);
        const regex_end_payer_name = regex_start_sub_array_payer_name.indexOf("60"); // Look for `<` to end the from which is 60 in ascii.
        const payer_name_array = regex_start_sub_array_payer_name.slice(0, regex_end_payer_name);

        // Get expected packed account number array
        const regex_start_mobile_number = Number(input["garanti_payer_mobile_num_idx"]);
        const regex_start_sub_array_mobile_number = input["in_body_padded"].slice(regex_start_mobile_number);
        const regex_end_mobile_number = regex_start_sub_array_mobile_number.indexOf("60"); // Look for `<` to end the from which is 60 in ascii.
        const mobile_number_array = regex_start_sub_array_mobile_number.slice(0, regex_end_mobile_number);

        // Chunk bytes into 7 and pack
        const toEmailChunkedArray = chunkArray(to_email_array, 7, 49);
        const packed_to_email_array = toEmailChunkedArray.map((arr, i) => bytesToPacked(arr));

        const nameChunkedArray = chunkArray(payer_name_array, 7, 49);
        const packed_payer_name_array = nameChunkedArray.map((arr, i) => bytesToPacked(arr));

        const mobileNumberChunkedArray = chunkArray(mobile_number_array, 7, 7);
        const packed_mobile_number_array = mobileNumberChunkedArray.map((arr, i) => bytesToPacked(arr));

        const combinedArray = packed_to_email_array.concat(packed_payer_name_array).concat(packed_mobile_number_array);
        const expected_hash = poseidon(combinedArray)

        assert.equal(JSON.stringify(poseidon.F.e(hashed_onramper_id)), JSON.stringify(expected_hash), true);
    });

    // SKIP BECAUSE STUBS
    it.skip("Should return the correct nullifier", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_garanti_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned nullifier
        const nullifier = witness[16];

        // Get expected nullifier
        const sha_out = await partialSha(input["in_padded"], input["in_len_padded_bytes"]);
        const packed_nullifier = packNullifier(sha_out);
        const cm_rand = hashSignatureGenRand(input["signature"], N, K, poseidon);
        const expected_nullifier = poseidon([cm_rand, packed_nullifier])
        assert.equal(JSON.stringify(poseidon.F.e(nullifier)), JSON.stringify(expected_nullifier), true);
    });

    it("Should return the correct intent hash", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_send.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned modulus
        const intent_hash = witness[17];

        // Get expected modulus
        const expected_intent_hash = input["intent_hash"];

        assert.equal(JSON.stringify(intent_hash), JSON.stringify(expected_intent_hash), true);
    });
});