import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("From Regex V3", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../../mocks/common/test_from_regex_v3.circom"),
            {
                include: path.join(__dirname, "../../../node_modules"),
                output: path.join(__dirname, "../../../build/test_from_regex_v3"),
                recompile: true,
                verbose: true,
            }
        );
    });


    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArray("from:PayLah! Alerts <paylah.alert@dbs.com>\r\nto:tes")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": textToAsciiArray("from:PayLah! Alerts <paylah.alert@dbs.com>\r\nto:tes")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should match regex once when canonicalization is Simple", async () => {
        const input = {
            "msg": textToAsciiArray("From: PayLah! Alerts <paylah.alert@dbs.com>\r\nto:te")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray("from:PayLah! Alerts <paylah.alert@dbs.com>\r\nto:tes")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("from:PayLah! Alerts <").length).fill("0")
            .concat(textToAsciiArray("paylah.alert@dbs.com"))
            .concat(Array(textToAsciiArray(">\r\nto:tes").length).fill("0"));
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray("from:PayLah! Alerts >paylah.alert@dbs.com>\r\nto:tes")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});