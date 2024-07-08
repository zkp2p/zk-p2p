import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Namecheap Transfer Details", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_namecheap_transfer_details.circom"),
            {
                include: path.join(__dirname, "../../../namecheap/node_modules"),
                output: path.join(__dirname, "../../../namecheap/build/test_namecheap_transfer_details"),
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
            "msg": textToAsciiArray(
                "The request to push the domain has been fulfilled.\r\n" +
                "Push to Login ID:  richard2015" +
                "\r\nThese changes apply to the following domain(s):\r\n" +
                "0xsachink.xyz\r\nPlease contact our support team if you have any questions."
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
                "The request to push the domain has been fulfilled.\r\n" +
                "Push to Login ID:  richard2015" +
                "\r\nThese changes apply to the following domain(s):\r\n" +
                "0xsachink.xyz\r\nPlease contact our support team if you have any questions."
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        console.log(witness);
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal first regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray(
                "The request to push the domain has been fulfilled.\r\n" +
                "Push to Login ID:  richard2015" +
                "\r\nThese changes apply to the following domain(s):\r\n" +
                "0xsachink.xyz\r\nPlease contact our support team if you have any questions."
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("The request to push the domain has been fulfilled.\r\nPush to Login ID:  ").length).fill("0")
            .concat(textToAsciiArray("richard2015"))
            .concat(Array(textToAsciiArray("\r\nThese changes apply to the following domain(s):\r\n0xsachink.xyz\r\nPlease contact our support team if you have any questions.").length).fill("0"))
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should reveal second regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray(
                "The request to push the domain has been fulfilled.\r\n" +
                "Push to Login ID:  richard2015" +
                "\r\nThese changes apply to the following domain(s):\r\n" +
                "0xsachink.xyz\r\nPlease contact our support team if you have any questions."
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("The request to push the domain has been fulfilled.\r\nPush to Login ID:  richard2015\r\nThese changes apply to the following domain(s):\r\n").length).fill("0")
            .concat(textToAsciiArray("0xsachink.xyz"))
            .concat(Array(textToAsciiArray("\r\nPlease contact our support team if you have any questions.").length).fill("0"))
        const result = witness.slice(input.msg.length + 2, input.msg.length * 2 + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray(
                "The request to pull the domain has been fulfilled.\r\n" +          // pull instead of push
                "Push to Login ID:  richard2015" +
                "\r\nThese changes apply to the following domain(s):\r\n" +
                "0xsachink.xyz\r\nPlease contact our support team if you have any questions."
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});