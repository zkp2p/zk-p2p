import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Venmo payee id", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_venmo_payee_id.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_venmo_payee_id"),
                recompile: true,
                verbose: true,
            }
        );
    });


    it("Should generate witnesses", async () => {
        const input = {
            "msg": [
                "32","32","32","61","50","48","13","10","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","104","114","101","102","61","51","68","34","104","116","116","112","115","58","47","47","118","101","110","109","111","46","99","111","109","47","99","111","100","101","63","117","115","101","114","95","105","100","61","51","68",
                "50","55","52","52","51","50","53","53","50","49","53","53","53","53","61","13","10","52","53","53","53","53", // Regex match
                "38","97","99","116","111","114","95","105","100"
            ] 
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": [
                "32","32","32","61","50","48","13","10","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","104","114","101","102","61","51","68","34","104","116","116","112","115","58","47","47","118","101","110","109","111","46","99","111","109","47","99","111","100","101","63","117","115","101","114","95","105","100","61","51","68",
                "50","55","52","52","51","50","53","53","50","49","53","53","53","53","61","13","10","52","53","53","53","53", // Regex match
                "38","97","99","116","111","114","95","105","100"
            ] 
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(22)));
    });

    it("Should reveal regex correctly", async () => {
        const input = {
            "msg": [
                "32","32","32","61","50","48","13","10","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","104","114","101","102","61","51","68","34","104","116","116","112","115","58","47","47","118","101","110","109","111","46","99","111","109","47","99","111","100","101","63","117","115","101","114","95","105","100","61","51","68",
                "50","55","52","52","51","50","53","53","50","49","53","53","53","53","61","13","10","52","53","53","53","53", // Regex match
                "38","97","99","116","111","114","95","105","100"
            ] 
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = [
            "0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0",
            "50","55","52","52","51","50","53","53","50","49","53","53","53","53","61","13","10","52","53","53","53","53", // Regex match
            "0","0","0","0","0","0","0","0","0"
        ];
        const result = witness.slice(2, 100 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": [
                "32","32","32","61","50","48","13","10","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","32","104","114","101","102","61","51","68","34","104","116","116","112","115","58","47","47","118","101","110","109","111","46","99","111","109","47","99","111","100","101","63","117","115","101","114","95","105","100","61","51","68",
                "68","55","52","52","51","50","53","53","50","49","53","53","53","53","61","13","10","52","53","53","53","53", // Replace first with 68
                "38","97","99","116","111","114","95","105","100"
            ]
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});