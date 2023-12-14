import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Venmo p2p check", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../../mocks/venmo/test_venmo_p2p_check.circom"),
            {
                include: path.join(__dirname, "../../../node_modules"),
                output: path.join(__dirname, "../../../build/test_venmo_p2p_check"),
                recompile: true,
                verbose: true,
            }
        );
    });

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArray(
                "EEEEEEEEE<br/><br/>As an obl=\r\n"
                + "igor of this payment, PayPal, Inc. (855-812-4430) is liable for non-deliver=\r\n"
                + "y or delayed delivery of your funds.<br/>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        const input = {
            "msg": textToAsciiArray(
                "EEEEEEEEE<br/><br/>As an obl=\r\n"
                + "igor of this payment, PayPal, Inc. (855-812-4430) is liable for non-deliver=\r\n"
                + "y or delayed delivery of your funds.<br/>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray(
                "EEEEEEEEE<br/><br/>As an obl=\r\n"
                + "igor of this payment, PayPal, Inc. (855-812-4320) is liable for non-deliver=\r\n"
                + "y or ddlayed delivery of your funds.<br/>" // update to d
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});
