import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("HDFC payment ID", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../../mocks/hdfc/test_hdfc_payment_id.circom"),
            {
                include: path.join(__dirname, "../../../node_modules"),
                output: path.join(__dirname, "../../../build/test_hdfc_payment_id"),
                recompile: true,
                verbose: true,
            }
        );
    });

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    it("Should generate witnesses", async () => {
        // No commas in payment_id.
        const input = {
            "msg": textToAsciiArray("\r\nansaction reference number is 123123123123.<br> <br> Please")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": textToAsciiArray("\r\nansaction reference number is 123123123123.<br> <br> Please")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });


    it("Should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray("\r\nansaction reference number is 123123123123.<br> <br> Please")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("\r\nansaction reference number is ").length).fill("0")
            .concat(textToAsciiArray("123123123123"))
            .concat(Array(textToAsciiArray(".<br> <br> Please").length).fill("0"));
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray("\r\nansaction reference number is 123123123123.<br> <br> PLease")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});