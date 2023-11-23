import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";
import { buildPoseidonOpt as buildPoseidon, buildMimcSponge, poseidonContract } from "circomlibjs";
import { chunkArray, bytesToPacked } from "./utils";
import { ethers } from "ethers";
import ganache from "ganache";

const { createCode, generateABI } = poseidonContract;
export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("HDFC Registration", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;
    let poseidonContract;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../hdfc_registration.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/hdfc_registration"),
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
        const hdfc_path = path.join(__dirname, "../inputs/input_hdfc_registration.json");
        const jsonString = fs.readFileSync(hdfc_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should return the correct modulus hash", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const hdfc_path = path.join(__dirname, "../inputs/input_hdfc_registration.json");
        const jsonString = fs.readFileSync(hdfc_path, "utf8");
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
        const hdfc_path = path.join(__dirname, "../inputs/input_hdfc_registration.json");
        const jsonString = fs.readFileSync(hdfc_path, "utf8");
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


    it("Should return the correct packed to email", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const hdfc_path = path.join(__dirname, "../inputs/input_hdfc_registration.json");
        const jsonString = fs.readFileSync(hdfc_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed from email
        // Indexes 5 to 10 represent the packed from email (15 \ 7)
        const packed_from_email = witness.slice(5, 10);

        // Get expected packed to email
        const regex_start = Number(input["email_to_idx"]);
        const regex_start_sub_array = input["in_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("13"); // Look for `\r` to end the from which is 13 in ascii. e.g. `to:0xAnonKumar@gmail.com`
        const to_email_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(to_email_array, 7, 35);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed email is the same
            assert.equal(expectedValue, packed_from_email[i], true);
        });
    });

    it("should return the correct packed account number", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const hdfc_path = path.join(__dirname, "../inputs/input_hdfc_registration.json");
        const jsonString = fs.readFileSync(hdfc_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned HDFC packed account number
        // Indexes 10 to 11 represent the packed from email (7 \ 7)
        const packed_account_number = witness.slice(10, 11);

        // Get expected packed account number array
        const regex_start = Number(input["hdfc_acc_num_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("32"); // Look for ` ` to end the from which is 32 in ascii.
        const account_number_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(account_number_array, 7, 7);

        chunkedArrays.map((arr, i) => {
            // Pack each cunk
            let expectedValue = bytesToPacked(arr);
            console.log('arr', arr)
            console.log('expectedValue', expectedValue)

            // Check packed account number is the same
            assert.equal(expectedValue, packed_account_number[i], true);
        });
    });


    it("Should return the correct hashed to email id + bank account number", async () => {
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
        const hdfc_path = path.join(__dirname, "../inputs/input_hdfc_registration.json");
        const jsonString = fs.readFileSync(hdfc_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed registration id
        // Indexes 11 represents the hashed registration id
        const hashed_registration_id = witness[11];

        // Get expected packed to email
        const regex_start_to_email = Number(input["email_to_idx"]);
        const regex_start_sub_array_to_email = input["in_padded"].slice(regex_start_to_email);
        const regex_end_to_email = regex_start_sub_array_to_email.indexOf("13"); // Look for `\r` to end the from which is 13 in ascii. e.g. `to:0xAnonKumar@gmail.com`
        const to_email_array = regex_start_sub_array_to_email.slice(0, regex_end_to_email);

        // Get expected packed account number array
        const regex_start_account_number = Number(input["hdfc_acc_num_idx"]);
        const regex_start_sub_array_account_number = input["in_body_padded"].slice(regex_start_account_number);
        const regex_end_account_number = regex_start_sub_array_account_number.indexOf("32"); // Look for ` ` to end the from which is 32 in ascii.
        const account_number_array = regex_start_sub_array_account_number.slice(0, regex_end_account_number);


        // Chunk bytes into 7 and pack
        const toEmailChunkedArray = chunkArray(to_email_array, 7, 35);
        const packed_to_email_array = toEmailChunkedArray.map((arr, i) => bytesToPacked(arr));

        const accountNumberChunkedArray = chunkArray(account_number_array, 7, 7);
        const packed_account_number_array = accountNumberChunkedArray.map((arr, i) => bytesToPacked(arr));

        const combinedArray = packed_to_email_array.concat(packed_account_number_array)
        const expected_hash = poseidon(combinedArray);
        const expected_hash_contract = await poseidonContract["poseidon(uint256[6])"](combinedArray);

        assert.equal(JSON.stringify(poseidon.F.e(hashed_registration_id)), JSON.stringify(expected_hash), true);
        assert.equal(JSON.stringify(poseidon.F.e(hashed_registration_id)), JSON.stringify(poseidon.F.e(expected_hash_contract.toString())), true);
    });

    // it("should fail to generate witness if receive email is provided", async () => {
    //     // Generate inputs for this test using `yarn gen-input:registration:receive`
    //     const venmo_path = path.join(__dirname, "../inputs/input_venmo_registration_receive.json");
    //     const jsonString = fs.readFileSync(venmo_path, "utf8");
    //     const input = JSON.parse(jsonString);
    //     try {
    //         await cir.calculateWitness(input, true);
    //         assert.fail('Expected calculateWitness to throw an error');
    //     } catch (error) {
    //         assert.instanceOf(error, Error);
    //         assert.equal(error.message, 'Error: Assert Failed.\nError in template VenmoRegistration_243 line: 65\n');
    //     }
    // });
});
