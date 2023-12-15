import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Paylah payee id", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../../mocks/paylah/test_paylah_payee_id.circom"),
            {
                include: path.join(__dirname, "../../../node_modules"),
                output: path.join(__dirname, "../../../build/test_paylah_payee_id"),
                recompile: true,
                verbose: true,
            }
        );
    });

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArray(
                "<td>To:</td>\r\n" +
                "<td>Steven 'O K-M Jr. (Mobile ending 2222)</td>\r\n</tr>"
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
                "<td>To:</td>\r\n" +
                "<td>Steven 'O K-M Jr. (Mobile ending 2222)</td>\r\n</tr>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal first regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray(
                "<td>To:</td>\r\n" +
                "<td>Steven 'O K-M Jr. (Mobile ending 2222)</td>\r\n</tr>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("<td>To:</td>\r\n<td>").length).fill("0")
            .concat(textToAsciiArray("Steven 'O K-M Jr. ")) // TODO: the space is included in regex extraction
            .concat(textToAsciiArray("(Mobile ending 2222)</td>\r\n</tr>").fill("0"));
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should reveal second regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray(
                "<td>To:</td>\r\n" +
                "<td>Steven 'O K-M Jr. (Mobile ending 2222)</td>\r\n</tr>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("<td>To:</td>\r\n<td>Steven 'O K-M Jr. (Mobile ending ").length).fill("0")
            .concat(textToAsciiArray("2222"))
            .concat(textToAsciiArray(")</td>\r\n</tr>").fill("0"));
        const result = witness.slice(input.msg.length + 2, input.msg.length * 2 + 2);
        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray(
                "<td>To:</td>\r\n" +
                "<td>Steven \r\n K-M Jr. (Mobile ending 2222)</td>\r\n</tr>" // Catches the line break
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});
