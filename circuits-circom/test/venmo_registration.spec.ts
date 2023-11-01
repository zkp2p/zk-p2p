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

describe("Venmo Registration", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let poseidon;
    let mimcSponge;
    let account;
    let poseidonContract;

    beforeAll(async () => {
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
    });

    it("Should return the correct modulus hash", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_send.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo send payment transaction
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
    });

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

    it("Should return the correct hashed actor id", async () => {
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
            generateABI(3),
            createCode(3),
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
        // Indexes 6 represents the hashed actor_id
        const hashed_actor_id = witness[5];

        // Get expected packed offramper_id
        // xxxx&actor_id=3Dxxxxxxxxxxxxxxxxxxx">
        const actor_id_selector = Buffer.from('&actor_id=3D');
        const venmo_actor_id_start_idx = (Buffer.from(input['in_body_padded']).indexOf(actor_id_selector) + actor_id_selector.length);
        const venmo_actor_id_end_idx = (Buffer.from(input['in_body_padded']).indexOf(Buffer.from('"', 'ascii'), venmo_actor_id_start_idx));
        const actor_id_array = input['in_body_padded'].slice(venmo_actor_id_start_idx, venmo_actor_id_end_idx);

        // Chunk bytes into 7 and pack
        const chunkedArrays = chunkArray(actor_id_array, 7, 21);

        const packed_actor_id = chunkedArrays.map((arr, i) => bytesToPacked(arr));
        const expected_hash = poseidon(packed_actor_id);
        const expected_hash_contract = await poseidonContract["poseidon(uint256[3])"](packed_actor_id);

        assert.equal(JSON.stringify(poseidon.F.e(hashed_actor_id)), JSON.stringify(expected_hash), true);
        assert.equal(JSON.stringify(poseidon.F.e(hashed_actor_id)), JSON.stringify(poseidon.F.e(expected_hash_contract.toString())), true);
    });

    it("should fail to generate witness if receive email is provided", async () => {
        // Generate inputs for this test using `yarn gen-input:registration:receive`
        const venmo_path = path.join(__dirname, "../inputs/input_venmo_registration_receive.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        try {
            await cir.calculateWitness(input, true);
            assert.fail('Expected calculateWitness to throw an error');
        } catch (error) {
            assert.instanceOf(error, Error);
            assert.equal(error.message, 'Error: Assert Failed.\nError in template VenmoRegistration_243 line: 65\n');
        }
    });
});
