const chai = require("chai");
const path = require("path");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const buildPoseidon = require("circomlibjs").buildPoseidonOpt;
const buildMimcSponge = require("circomlibjs").buildMimcSponge;
const { createCode, generateABI } = require("circomlibjs").poseidonContract;
const { chunkArray, bytesToPacked } = require("./utils.js");
const { ethers } = require("ethers");
const ganache = require("ganache");

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Venmo Registration", function () {
    this.timeout(100000);

    let cir;
    let poseidon;
    let mimcSponge;
    let account;
    let poseidonContract;

    before( async() => {
        cir = await wasm_tester(
            path.join(__dirname, "../venmo_registration.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/venmo_registration"),
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
        const venmo_path = path.join(__dirname, "../inputs/input_venmo_registration.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    }).timeout(1000000);

    it("Should return the correct modulus hash", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_receive.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo receive payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_venmo_registration.json");
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
    }).timeout(1000000);

    it("Should return the correct packed from email", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_venmo_registration.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed from email
        // Indexes 2 to 7 represent the packed from email (30 bytes \ 7)
        const packed_from_email = witness.slice(2, 7);

        // Get expected packed from email
        const regex_start = Number(input["email_from_idx"]);
        const regex_start_sub_array = input["in_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("62"); // Look for `>` to end the from which is 62 in ascii. e.g. `from:<venmo@venmo.com>`
        const from_email_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(from_email_array, 7, 30);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed email is the same
            assert.equal(expectedValue, packed_from_email[i], true);
        });
    }).timeout(1000000);

    it("Should return the correct packed offramper id", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_venmo_registration.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned packed offramper_id
        // Indexes 7 to 12 represent the packed actor_id (30 bytes \ 7)
        const packed_actor_id = witness.slice(7, 12);

        // Get expected packed offramper_id
        const regex_start = Number(input["venmo_actor_id_idx"]);
        const regex_start_sub_array = input["in_body_padded"].slice(regex_start);
        const regex_end = regex_start_sub_array.indexOf("34"); // Look for `"` to end the actor_id which is 34 in ascii 
        const actor_id_array = regex_start_sub_array.slice(0, regex_end);

        // Chunk bytes into 7 and pack
        let chunkedArrays = chunkArray(actor_id_array, 7, 30);

        chunkedArrays.map((arr, i) => {
            // Pack each chunk
            let expectedValue = bytesToPacked(arr);

            // Check packed actor_id is the same
            assert.equal(expectedValue, packed_actor_id[i], true);
        });
    }).timeout(1000000);

    it("Should return the correct hashed actor id", async () => {
        const provider = new ethers.providers.Web3Provider(ganache.provider());
        account = provider.getSigner(0);
        const C6 = new ethers.ContractFactory(
            generateABI(5),
            createCode(5),
            account
          );
    
        poseidonContract = await C6.deploy();
        
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_venmo_registration.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // Get returned hashed actor_id
        // Indexes 12 represents the hashed actor_id
        const hashed_actor_id = witness[12];

        // Get expected hashed actor_id
        const packed_actor_id = witness.slice(7, 12);
        const expected_hash = poseidon(packed_actor_id);
        const expected_hash_contract = await poseidonContract["poseidon(uint256[5])"](packed_actor_id);

        assert.equal(JSON.stringify(poseidon.F.e(hashed_actor_id)), JSON.stringify(expected_hash), true);
        assert.equal(JSON.stringify(poseidon.F.e(hashed_actor_id)), JSON.stringify(poseidon.F.e(expected_hash_contract.toString())), true);
    }).timeout(1000000);
});
