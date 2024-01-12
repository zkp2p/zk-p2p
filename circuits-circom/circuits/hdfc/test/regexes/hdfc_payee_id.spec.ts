import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("HDFC payer id", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_hdfc_payee_id.circom"),
            {
                include: path.join(__dirname, "../../../hdfc/node_modules"),
                output: path.join(__dirname, "../../../hdfc/build/test_hdfc_payee_id"),
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
            "msg": textToAsciiArray("5678 to VPA sachin1234@paytm on 28-10-23")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": textToAsciiArray("5678 to VPA sachin1234@paytm on 28-10-23")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should match regex once when there is hyphen (-) in the UPI ID", async () => {
        const input = {
            "msg": textToAsciiArray("5678 to VPA sachin1234-1@paytm on 28-10-")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should match regex once when there is dot (.) in the UPI ID", async () => {
        const input = {
            "msg": textToAsciiArray("5678 to VPA sachin1234.1@paytm on 28-10-")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should match regex once when there is underscore (_) in the UPI ID", async () => {
        const input = {
            "msg": textToAsciiArray("5678 to VPA sachin1234_1@paytm on 28-10-")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray("5678 to VPA sachin1234@paytm on 28-10-23")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        // 0s, sachin1234@paytm, 0s
        const expected = Array(textToAsciiArray("5678 to VPA ").length).fill("0")
            .concat(textToAsciiArray("sachin1234@paytm"))
            .concat(Array(textToAsciiArray(" on 28-10-23").length).fill("0"));
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray("5678 to VPA sachin1234apaytm on 28-10-23") // @ missing
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});