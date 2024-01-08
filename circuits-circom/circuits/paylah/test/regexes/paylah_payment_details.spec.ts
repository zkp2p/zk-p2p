import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');
const MIN_LEN = 189;

describe("Paylah payment details", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;
    let input;

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    function textToAsciiArrayPadded(text: string): string[] {
        while (text.length < MIN_LEN) {
            text += " ";
        }
        return textToAsciiArray(text);
    }

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_paylah_payment_details.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_paylah_payment_details"),
                recompile: true,
                verbose: true,
            }
        );
        input = {
            "msg": textToAsciiArray(
                "<td>Amount:</td>\r\n<td>SGD300.00</td>\r\n" +
                "</tr>\r\n<tr>\r\n" +
                "<td>From:</td>\r\n" +
                "<td>PayLah! Wallet (Mobile ending 1111)</td>\r\n" +
                "</tr>\r\n<tr>\r\n" +
                "<td>To:</td>\r\n" +
                "<td>Steven 'O K-M Jr. (Mobile ending 2222)</td>\r\n"
            )
        };
    });

    const subject = async (input) => {
        return await cir.calculateWitness(
            input,
            true
        );
    }

    it("Should generate witnesses", async () => {
        const witness = await subject(input);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    it("Should match regex once", async () => {
        console.log(input.msg.length)
        const witness = await subject(input);

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal amount correctly", async () => {
        const witness = await subject(input);

        const expected = Array(textToAsciiArray("<td>Amount:</td>\r\n<td>SGD").length).fill("0")
            .concat(textToAsciiArray("300.00"))
            .concat(textToAsciiArray("</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>From:</td>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>PayLah! Wallet (Mobile ending 1111)</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>To:</td>\r\n<td>Steven 'O K-M Jr. (Mobile ending 2222)</td>\r\n").fill("0"))

        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should reveal the payer mobile num correctly", async () => {
        const witness = await subject(input);

        const expected = Array(textToAsciiArray("<td>Amount:</td>\r\n<td>SGD").length).fill("0")
            .concat(textToAsciiArray("300.00")).fill("0")
            .concat(textToAsciiArray("</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>From:</td>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>PayLah! Wallet (Mobile ending ")).fill("0")
            .concat(textToAsciiArray("1111"))
            .concat(textToAsciiArray(")</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>To:</td>\r\n<td>Steven 'O K-M Jr. (Mobile ending 2222)</td>\r\n").fill("0"));

        const result = witness.slice(input.msg.length + 2, input.msg.length * 2 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("should reveal the payee name correctly", async () => {
        const witness = await subject(input);

        const expected = Array(textToAsciiArray("<td>Amount:</td>\r\n<td>SGD").length).fill("0")
            .concat(textToAsciiArray("300.00")).fill("0")
            .concat(textToAsciiArray("</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>From:</td>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>PayLah! Wallet (Mobile ending ")).fill("0")
            .concat(textToAsciiArray("1111")).fill("0")
            .concat(textToAsciiArray(")</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>To:</td>\r\n<td>")).fill("0")
            .concat(textToAsciiArray("Steven 'O K-M Jr. "))     // TODO: the space is included in regex extraction
            .concat(textToAsciiArray("(Mobile ending 2222)</td>\r\n").fill("0"));

        const result = witness.slice(input.msg.length * 2 + 2, input.msg.length * 3 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("should reveal the payee mobile num correctly", async () => {
        const witness = await subject(input);

        const expected = Array(textToAsciiArray("<td>Amount:</td>\r\n<td>SGD").length).fill("0")
            .concat(textToAsciiArray("300.00")).fill("0")
            .concat(textToAsciiArray("</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>From:</td>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>PayLah! Wallet (Mobile ending ")).fill("0")
            .concat(textToAsciiArray("1111")).fill("0")
            .concat(textToAsciiArray(")</td>\r\n").fill("0"))
            .concat(textToAsciiArray("</tr>\r\n<tr>\r\n").fill("0"))
            .concat(textToAsciiArray("<td>To:</td>\r\n<td>Steven 'O K-M Jr. (Mobile ending ")).fill("0")
            .concat(textToAsciiArray("2222"))
            .concat(textToAsciiArray(")</td>\r\n").fill("0"));

        const result = witness.slice(input.msg.length * 3 + 2, input.msg.length * 4 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        input = {
            "msg": textToAsciiArrayPadded(
                "<td>Amount:</td>\r\n<td>SGD300.00</td>\r\n" +
                "</tr>\r\n<tr>\r\n" +
                "<td>From:</td>\r\n" +
                "<td>PayLah! Wallet (Mobile ending 1111)</td>\r\n" +
                "</tr>\r\n<tr>\r\n" +
                "<td>To:</td>\r\n" +
                "<td>WISE ASIA-PACIFIC PTE LTD</td>\r\n"        // Replace payee name with company name
            )
        };

        const witness = await subject(input);

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});
