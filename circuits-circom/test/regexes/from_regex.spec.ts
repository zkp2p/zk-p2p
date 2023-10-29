import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Venmo Actor ID", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_from_regex.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_from_regex"),
                recompile: true,
                verbose: true,
            }
        );
    });


    it("Should generate witnesses", async () => {
        const input = {
            "msg": [
                "102","114","111","109","58","86","101","110","109","111","32","60",
                "118","101","110","109","111","64","118","101","110","109","111","46","99","111","109", // Regex match
                "62","13","10","114","101","112","108","121","45","116","111","58","86","101","110","109","111","32","78","111","45","114","101",
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
                "102","114","111","109","58","86","101","110","109","111","32","60",
                "118","101","110","109","111","64","118","101","110","109","111","46","99","111","109", // Regex match
                "62","13","10","114","101","112","108","121","45","116","111","58","86","101","110","109","111","32","78","111","45","114","101",
            ]
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal regex correctly", async () => {
        const input = {
            "msg": [
                "102","114","111","109","58","86","101","110","109","111","32","60",
                "118","101","110","109","111","64","118","101","110","109","111","46","99","111","109", // Regex match
                "62","13","10","114","101","112","108","121","45","116","111","58","86","101","110","109","111","32","78","111","45","114","101",
            ]
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = [
            "0","0","0","0","0","0","0","0","0","0","0","0",
            "118","101","110","109","111","64","118","101","110","109","111","46","99","111","109", // Regex match
            "0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"
        ];
        const result = witness.slice(2, 50 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": [
                "102","114","111","109","58","86","101","110","109","111","32","68", // Replace with 68
                "118","101","110","109","111","64","118","101","110","109","111","46","99","111","109",
                "62","13","10","114","101","112","108","121","45","116","111","58","86","101","110","109","111","32","78","111","45","114","101",
            ]
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});