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

describe("HDFC send WASM tester", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;
    let poseidonContract;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../hdfc_send.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/hdfc_send"),
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
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
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
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
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
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
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
        let chunkedArrays = chunkArray(from_email_array, 7, 15);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed email is the same
            assert.equal(expectedValue, packed_from_email[i], true);
        });
    });

    // There's probably a diff on how the packing happens on contract / circuit vs how we do it here.
    it("Should return the correct packed amount", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed amount
        // Indexes 5 to 7 represent the packed amount (8 \ 7)
        const packed_amount = witness.slice(5, 7);

        // Get expected packed amount
        const regex_start = Number(input["hdfc_amount_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("32"); // Look for `space` to end the amount which is 32 in ascii
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

    it("Should return the correct packed date", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_receive.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo receive payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed timestamp
        // Indexes 7 to 9 represent the packed timestamp; (10 \ 7)
        const packed_timestamp = witness.slice(7, 12);

        // Get expected packed timestamp
        const regex_start = Number(input["email_date_idx"]);
        const regex_start_sub_array = input["in_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("13"); // Look for `\r` to end the timestamp which is 13 in ascii
        const date_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(date_array, 7, 31);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed timestamp is the same
            assert.equal(expectedValue, packed_timestamp[i], true);
        });
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

        poseidonContract = await C6.deploy();

        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed offramper_id
        // Index 9 represents the hashed offramper_id
        const hashed_offramper_id = witness[12];

        // Get expected packed offramper_id
        const regex_start = Number(input["hdfc_payee_id_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("32");  // Look for ` ` to end the offramper_id which is 32 in ascii
        const offramper_id_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        const chunkedArrays = chunkArray(offramper_id_array, 7, 42);

        const packed_offramper_id = chunkedArrays.map((arr, i) => bytesToPacked(arr));
        const expected_hash = poseidon(packed_offramper_id);
        const expected_hash_contract = await poseidonContract["poseidon(uint256[6])"](packed_offramper_id);

        assert.equal(JSON.stringify(poseidon.F.e(hashed_offramper_id)), JSON.stringify(expected_hash), true);
        assert.equal(JSON.stringify(poseidon.F.e(hashed_offramper_id)), JSON.stringify(poseidon.F.e(expected_hash_contract.toString())), true);
    });

    // NOTE: WOULD FAIL IF WE ARE USING STUB.
    it.skip("Should return the correct nullifier", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned nullifier
        const nullifier = witness[13];

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
        const venmo_path = path.join(__dirname, "../inputs/input_hdfc_send.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned modulus
        const intent_hash = witness[14];

        // Get expected modulus
        const expected_intent_hash = input["intent_hash"];

        assert.equal(JSON.stringify(intent_hash), JSON.stringify(expected_intent_hash), true);
    });
});