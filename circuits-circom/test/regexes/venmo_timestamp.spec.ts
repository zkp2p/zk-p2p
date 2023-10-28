import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Venmo timestamp", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_venmo_timestamp.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_venmo_timestamp"),
                recompile: true,
                verbose: true,
            }
        );
    });


    it("Should generate witnesses", async () => {
        const input = {
            "msg": [
                "120","102","116","107","108","121","59","32","100","61","118","101","110","109","111","46","99","111","109","59","32","116","61",
                "49","54","57","56","50","54","48","54","56","55","59", // Regex match
                "32","104","61","70","114","111"
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
                "120","102","116","107","108","121","59","32","100","61","118","101","110","109","111","46","99","111","109","59","32","116","61",
                "49","54","57","56","50","54","48","54","56","55", // Regex match
                "59","32","104","61","70","114","111"
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
                "120","102","116","107","108","121","59","32","100","61","118","101","110","109","111","46","99","111","109","59","32","116","61",
                "49","54","57","56","50","54","48","54","56","55", // Regex match
                "59","32","104","61","70","114","111"
            ]
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = [
            "0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0",
            "49","54","57","56","50","54","48","54","56","55", // Regex match
            "0","0","0","0","0","0","0"
        ];
        const result = witness.slice(2, 40 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": [
                "120","102","116","107","108","121","59","32","100","61","118","101","110","109","111","46","99","111","109","59","32","116","62", // Update to 62
                "49","54","57","56","50","54","48","54","56","55",
                "59","32","104","61","70","114","111"
            ] 
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});