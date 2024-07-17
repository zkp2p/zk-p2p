import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";
import { buildPoseidonOpt as buildPoseidon, buildMimcSponge, poseidonContract } from "circomlibjs";
import { chunkArray, bytesToPacked, chunkedBytesToBigInt, packNullifier, hashSignatureGenRand } from "../../utils/test-utils";
import { partialSha } from "@zk-email/helpers/src/sha-utils";

import { bigIntToChunkedBytes } from "@zk-email/helpers/dist/binary-format";
import { ethers } from "ethers";
import ganache from "ganache";

const { createCode, generateABI } = poseidonContract;
export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

// Constants used in the circuit
const N = 121;
const K = 17;

describe("Namecheap Push Domain Circuit", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../namecheap_push.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/namecheap_push"),
                recompile: false, // setting this to true will recompile the circuit (~3-5min)
                verbose: true,
            }
        );

        poseidon = await buildPoseidon();
        mimcSponge = await buildMimcSponge();
    });

    it("Should generate witnesses", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example namecheap_push.eml to run tests 
        // Otherwise, you can download the original eml from any Namecheap push domain email
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should return the correct pubkey hash", async () => {
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
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
        const modulus = chunkedBytesToBigInt(input["pubkey"], 121);
        const pubkeyChunked = bigIntToChunkedBytes(modulus, 242, 9);
        const expected_hash = poseidon(pubkeyChunked);

        assert.equal(JSON.stringify(mimcSponge.F.e(modulus_hash)), JSON.stringify(expected_hash), true);
    });

    it("Should return the correct packed from email", async () => {
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed from email
        const packed_from_email = witness.slice(2, 3);

        // Get expected packed from email
        const regex_start = Number(input["fromEmailIndex"]);
        const regex_start_sub_array = input["emailHeader"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("62"); // Look for `>` to end the from which is 62 in ascii. e.g. `from:<venmo@venmo.com>`
        const from_email_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 31 and pack
        let chunkedArrays = chunkArray(from_email_array, 31, 21);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed email is the same
            assert.equal(expectedValue, packed_from_email[i], true);
        });
    });

    it("Should return the correct packed date", async () => {
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed amount
        const packed_amount = witness.slice(3, 4);

        // Get expected packed date
        const regex_start = Number(input["namecheapDateIndex"]);
        const regex_start_sub_array = input["emailBody"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("13"); // Look for `\r` to end the date which is 13 in ASCII
        const date_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 31 and pack
        let chunkedArrays = chunkArray(date_array, 31, 10);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed amount is the same
            assert.equal(expectedValue, packed_amount[i], true);
        });
    });

    it("Should return the correct packed domain name", async () => {
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed domain name
        const packed_domain_name = witness.slice(4, 9);

        // Get expected packed domain name
        const regex_start = Number(input["namecheapDomainNameIndex"]);
        const regex_start_sub_array = input["emailBody"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("13"); // Look for `\r` to end the domain name which is 13 in ASCII
        const domain_name_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 31 and pack
        let chunkedArrays = chunkArray(domain_name_array, 31, 127);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed domain name is the same
            assert.equal(expectedValue, packed_domain_name[i], true);
        });
    });


    it("Should return the correct hashed packed buyer id", async () => {
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed buyer id
        const buyerIdHash = witness[9];

        // Get expected packed buyer id
        const regex_start = Number(input["namecheapBuyerIdIndex"]);
        const regex_start_sub_array = input["emailBody"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("13"); // Look for `\r` to end the buyer id which is 13 in ASCII
        const buyer_id_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 31 and pack
        let chunkedArray = chunkArray(buyer_id_array, 31, 31);

        // Poseidon hash the chunkedArray
        const expectedHashedBuyerId = poseidon(chunkedArray.map(arr => bytesToPacked(arr)));

        // Compare the hashed buyer id with the buyerIdHash from the witness
        assert.equal(JSON.stringify(poseidon.F.e(buyerIdHash)), JSON.stringify(expectedHashedBuyerId), true);
    });

    it("Should return the correct nullifier", async () => {
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned nullifier
        const nullifier = witness[10];

        // Get expected nullifier
        const sha_out = await partialSha(input["emailHeader"], input["emailHeaderLength"]);
        const packed_nullifier = packNullifier(sha_out);
        const cm_rand = hashSignatureGenRand(input["signature"], N, K, poseidon);
        const expected_nullifier = poseidon([cm_rand, packed_nullifier])
        assert.equal(JSON.stringify(poseidon.F.e(nullifier)), JSON.stringify(expected_nullifier), true);
    });


    it("Should return the correct order id", async () => {
        const input_path = path.join(__dirname, "../inputs/input_namecheap_push.json");
        const jsonString = fs.readFileSync(input_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned modulus
        const order_id = witness[11];

        // Get expected modulus
        const expected_order_id = input["orderId"];

        assert.equal(JSON.stringify(order_id), JSON.stringify(expected_order_id), true);
    });
});