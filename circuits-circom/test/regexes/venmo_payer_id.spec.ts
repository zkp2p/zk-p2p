import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Venmo payer id", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_venmo_payer_id.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_venmo_payer_id"),
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
            "msg": textToAsciiArray("= 3D\"ht=\r\ntps://venmo.com/code?user_id=3D274432553155354535&actor_id=3D1168869611798565=\r\n289664>>>>")
        };
        console.log(input.msg.length);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": textToAsciiArray("= 3D\"ht=\r\ntps://venmo.com/code?user_id=3D274432553155354535&actor_id=3D1168869611798565=\r\n289664>>>>")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(18)));
    });

    it("Should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray("= 3D\"ht=\r\ntps://venmo.com/code?user_id=3D274432553155354535&actor_id=3D1168869611798565=\r\n289664>>>>")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("= 3D\"ht=\r\ntps://venmo.com/code?user_id=3D").length).fill("0")
            .concat(textToAsciiArray("274432553155354535"))
            .concat(Array(textToAsciiArray("&actor_id=3D1168869611798565=\r\n289664>>>>").length).fill("0"));
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray("= 3D\"ht=\r\ntps://venmo.com/code?user_id=3DD74432553155354535&actor_id=3DD168869611798565=\r\n289664>>>>")   // replace 3D with 3DD
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});