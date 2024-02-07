import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";
import { buildPoseidonOpt as buildPoseidon, buildMimcSponge, poseidonContract } from "circomlibjs";
import { chunkArray, bytesToPacked, chunkedBytesToBigInt, base64ToByteArray, packedToBytes } from "../../utils/test-utils";
import { bigIntToChunkedBytes } from "@zk-email/helpers/dist/binaryFormat";
import { ethers } from "ethers";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');


describe("Garanti registration WASM tester", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let cir_hasher;
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

        cir_hasher = await wasm_tester(
            path.join(__dirname, "../garanti_body_suffix_hasher.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/garanti_body_suffix_hasher"),
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

    it("Should return the correct intermediate hash packed", async () => {
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // This is a workaround to use our divided hasher because no JS SHA256 libraries do not support a precomputed initial state
        // We test that the precomputed SHA hashed + intermediate body is equal to the expected SHA from the registration circuit

        let paddedArray = Array.from({ length: 10752 }, (v, i) => input["in_body_padded"][i] || "0");

        const hasher_witness = await cir_hasher.calculateWitness(
            {
                intermediate_hash: input["precomputed_sha"],
                in_body_suffix_padded: paddedArray,
                in_body_suffix_len_padded_bytes: input["in_body_len_padded_bytes"],
            },
            true
        );

        assert(Fr.eq(Fr.e(hasher_witness[0]), Fr.e(1)));
        assert.equal(witness[2], hasher_witness[3], true);
        assert.equal(witness[3], hasher_witness[4], true);
    });

    it("Should return the correct body hash packed", async () => {
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

        assert.equal(witness[4], expectedFirst, true);
        assert.equal(witness[5], expectedSecond, true);
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

        // Get expected packed account number array
        const regex_start_mobile_number = Number(input["garanti_payer_mobile_num_idx"]);
        const regex_start_sub_array_mobile_number = input["in_body_padded"].slice(regex_start_mobile_number);
        const regex_end_mobile_number = regex_start_sub_array_mobile_number.indexOf("60"); // Look for `<` to end the from which is 60 in ascii.
        const mobile_number_array = regex_start_sub_array_mobile_number.slice(0, regex_end_mobile_number);

        // Chunk bytes into 7 and pack
        const toEmailChunkedArray = chunkArray(to_email_array, 7, 49);
        const packed_to_email_array = toEmailChunkedArray.map((arr, i) => bytesToPacked(arr));

        const mobileNumberChunkedArray = chunkArray(mobile_number_array, 7, 7);
        const packed_mobile_number_array = mobileNumberChunkedArray.map((arr, i) => bytesToPacked(arr));

        const combinedArray = packed_to_email_array.concat(packed_mobile_number_array);
        const expected_hash = poseidon(combinedArray)

        assert.equal(JSON.stringify(poseidon.F.e(hashed_onramper_id)), JSON.stringify(expected_hash), true);
    });

    it("Should fail if padding is not all zeroes", async () => {
        const input_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        input["in_body_padded"][input["in_body_padded"].length - 2] = "1";

        try {
            const witness = await cir.calculateWitness(input, true);
            await cir.checkConstraints(witness);
        } catch (error) {
            expect((error as Error).message).toMatch("Assert Failed");
        }
    });

    describe("Body Suffix Hasher", function () {
        it("Should generate witnesses", async () => {
            // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example garanti_send.eml to run tests 
            // Otherwise, you can download the original eml from any garanti send payment transaction
            const input_path = path.join(__dirname, "../inputs/input_garanti_body_suffix_hasher.json");
            const jsonString = fs.readFileSync(input_path, "utf8");
            const input = JSON.parse(jsonString);
            const witness = await cir_hasher.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        });

        it("Should return the packed precomputed SHA equal to output SHA of Garanti registration", async () => {
            const input_hasher_path = path.join(__dirname, "../inputs/input_garanti_body_suffix_hasher.json");
            const jsonStringHasher = fs.readFileSync(input_hasher_path, "utf8");
            const input_hasher = JSON.parse(jsonStringHasher);
            const witness_hasher = await cir_hasher.calculateWitness(
                input_hasher,
                true
            );
            const input_registration_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
            const jsonStringRegistration = fs.readFileSync(input_registration_path, "utf8");
            const input_registration = JSON.parse(jsonStringRegistration);
            const witness_registration = await cir.calculateWitness(
                input_registration,
                true
            );

            assert.equal(witness_hasher[1], witness_registration[2], true);
            assert.equal(witness_hasher[2], witness_registration[3], true);
        });

        it("Should return the same body hash packed as Garanti registration", async () => {
            const input_hasher_path = path.join(__dirname, "../inputs/input_garanti_body_suffix_hasher.json");
            const jsonStringHasher = fs.readFileSync(input_hasher_path, "utf8");
            const input_hasher = JSON.parse(jsonStringHasher);
            const witness_hasher = await cir_hasher.calculateWitness(
                input_hasher,
                true
            );
            const input_registration_path = path.join(__dirname, "../inputs/input_garanti_registration.json");
            const jsonStringRegistration = fs.readFileSync(input_registration_path, "utf8");
            const input_registration = JSON.parse(jsonStringRegistration);
            const witness_registration = await cir.calculateWitness(
                input_registration,
                true
            );

            assert.equal(witness_hasher[3], witness_registration[4], true);
            assert.equal(witness_hasher[4], witness_registration[5], true);
        });
    })
});