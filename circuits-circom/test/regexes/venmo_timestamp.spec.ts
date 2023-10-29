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


    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArray("xftkly; d=venmo.com; t=1698260687; h=Fro")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": textToAsciiArray("xftkly; d=venmo.com; t=1698260687; h=Fro")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray("xftkly; d=venmo.com; t=1698260687; h=Fro")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("xftkly; d=venmo.com; t=").length).fill("0")
            .concat(textToAsciiArray("1698260687"))
            .concat(Array(textToAsciiArray("; h=Fro").length).fill("0"));
        const result = witness.slice(2, 40 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray("xftkly; D=venmo.com; t=1698260687; h=Fro")     // D instead of d
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});