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

describe("Paylah registration WASM tester", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;
    let poseidonContract1;
    let poseidonContract2;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../paylah_registration.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/paylah_registration"),
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
        const input_path = path.join(__dirname, "../inputs/input_paylah_registration.json");
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
        const input_path = path.join(__dirname, "../inputs/input_paylah_registration.json");
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
        const input_path = path.join(__dirname, "../inputs/input_paylah_registration.json");
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

        /// TODO: SUS???/// TODO: SUS???/// TODO: SUS???

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(from_email_array, 7, 20);    /// TODO: SUS???

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed email is the same
            assert.equal(expectedValue, packed_from_email[i], true);
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
        const input_path = path.join(__dirname, "../inputs/input_paylah_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed onramper id
        const hashed_onramper_id = witness[5];

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
});