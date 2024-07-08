import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Namecheap Subject", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_namecheap_subject.circom"),
            {
                include: path.join(__dirname, "../../../namecheap/node_modules"),
                output: path.join(__dirname, "../../../namecheap/build/test_namecheap_subject"),
                recompile: true,
                verbose: true,
            }
        );
    });

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArray("\r\nSubject: PUSH DOMAIN CONFIRMATION EMAIL - Namecheap.com\r\n")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": textToAsciiArray("\r\nSubject: PUSH DOMAIN CONFIRMATION EMAIL - Namecheap.com\r\n")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray("\r\nsubject: PUSH DOMAIN CONFIRMATION EMAIL - Namecheap.com\r\n")   // subject is lowercase
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});