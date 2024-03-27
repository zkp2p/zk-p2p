import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Remove Line Break Regex", () => {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "./mocks/test_remove_line_break.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/test_remove_line_break"),
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
            "in": textToAsciiArray("abcd=\r\nefg")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("should remove line break", async () => {
        const input = {
            "in": textToAsciiArray("abcd=\r\nefg")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // expected; abcdefg with 3 padded 0s
        const expected = textToAsciiArray("abcdefg\0\0\0")
        const result = witness.slice(1, input.in.length + 1);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    describe("when line break is not present", () => {

        it("should return correct output", async () => {
            const input = {
                "in": textToAsciiArray("abcdefghij")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            const expected = textToAsciiArray("abcdefghij")
            const result = witness.slice(1, input.in.length + 1);
            assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
        });
    });
});