import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";
import { buildPoseidonOpt as buildPoseidon, buildMimcSponge, poseidonContract } from "circomlibjs";
import { chunkArray, bytesToPacked, chunkedBytesToBigInt, base64ToByteArray } from "../../utils/test-utils";
import { bigIntToChunkedBytes } from "@zk-email/helpers/dist/binaryFormat";
import { ethers } from "ethers";
import ganache from "ganache";

const { createCode, generateABI } = poseidonContract;
export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');


describe("Garanti registration WASM tester", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../garanti_registration.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/garanti_registration"),
                recompile: false, // setting this to true will recompile the circuit (~3-5min)
                verbose: true,
            }
        );

        poseidon = await buildPoseidon();
        mimcSponge = await buildMimcSponge();
    });

    it("Should generate witnesses", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example garanti_send.eml to run tests 
        // Otherwise, you can download the original eml from any garanti send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should return the correct modulus hash", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example garanti_receive.eml to run tests 
        // Otherwise, you can download the original eml from any garanti receive payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned modulus hash
        const modulus_hash = witness[1];

        // Calculate the expected poseidon hash with pubkey chunked to 9*242 like in circuit
        const poseidon = await buildPoseidon();
        const modulus = chunkedBytesToBigInt(input["modulus"], 121);
        const pubkeyChunked = bigIntToChunkedBytes(modulus, 242, 9);
        const expected_hash = poseidon(pubkeyChunked);

        assert.equal(JSON.stringify(mimcSponge.F.e(modulus_hash)), JSON.stringify(expected_hash), true);
    });

    // TODO
    it.only("Should return the correct intermediate hash packed", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example garanti_receive.eml to run tests 
        // Otherwise, you can download the original eml from any garanti receive payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );
        
        // const expectedIntermediateHash = sha256Precomputed(input["in_padded"].slice(0, Number(input["in_len_padded_bytes"])));
        // console.log(expectedIntermediateHash)
        // console.log(input["in_body_padded"].slice(0, Number(input["in_body_len_padded_bytes"])))

        // const expectedIntermediateHashPacked = chunkArray(expectedIntermediateHash, 16, 32);
        // const expectedFirst = bytesToPacked(expectedIntermediateHashPacked[0]);
        // const expectedSecond = bytesToPacked(expectedIntermediateHashPacked[1]);
        // console.log(expectedFirst, expectedSecond)

        // assert.equal(witness[1], expectedFirst);
        // assert.equal(witness[2], expectedSecond);
    });

    it("Should return the correct body hash packed", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example garanti_receive.eml to run tests 
        // Otherwise, you can download the original eml from any garanti receive payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get expected body hash packed
        const regex_start_body_hash = Number(input["body_hash_idx"]);
        const regex_start_sub_array_body_hash = input["in_padded"].slice(regex_start_body_hash);
        const regex_end_body_hash = regex_start_sub_array_body_hash.indexOf("59"); // Look for ; to end the from which is 59 in ascii.
        const body_hash_array = regex_start_sub_array_body_hash.slice(0, regex_end_body_hash);

        // Decode body hash
        const expectedBodyHashArray = base64ToByteArray(body_hash_array);
    
        const bodyHashChunkedArray = chunkArray(expectedBodyHashArray, 16, 32);
        const expectedFirst = bytesToPacked(bodyHashChunkedArray[0]);
        const expectedSecond = bytesToPacked(bodyHashChunkedArray[1]);
        
        assert.equal(witness[4], expectedFirst);
        assert.equal(witness[5], expectedSecond);
    });

    it("Should return the correct packed from email", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example garanti_send.eml to run tests 
        // Otherwise, you can download the original eml from any garanti send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed from email
        // Indexes 6 to 11 represent the packed from email (31 \ 7)
        const packed_from_email = witness.slice(6, 11);

        // Get expected packed from email
        const regex_start = Number(input["email_from_idx"]);
        const regex_start_sub_array = input["in_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("62"); // Look for `>` to end the from which is 62 in ascii. e.g. `from:<garanti@garanti.com>`
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

        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example garanti_send.eml to run tests 
        // Otherwise, you can download the original eml from any garanti send payment transaction
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed onramper id
        const hashed_onramper_id = witness[11];

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
});