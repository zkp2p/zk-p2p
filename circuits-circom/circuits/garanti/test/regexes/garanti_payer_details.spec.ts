import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Garanti payer details", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_garanti_payer_details.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../../build/test_garanti_payer_details"),
                recompile: true,
                verbose: true,
            }
        );
    });

    function textUtf8ToAsciiArray(text: string): string[] {
        const utf8Encoder = new TextEncoder(); // TextEncoder encodes into UTF-8 by default
        const utf8Bytes = utf8Encoder.encode(text);
        return Array.from(utf8Bytes).map(byte => byte.toString());
    }

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textUtf8ToAsciiArray(
                "          <p>G&ouml;nderen Bilgileri:<br>\r\n" +
                "                    <strong>ĞÜÖÇıİçğİ SSŞİşöü<br>Ş BBESEE -  1111<br>1233362</strong></p>\r\n" +
                "        <p>"
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
           "msg": textUtf8ToAsciiArray(
                "          <p>G&ouml;nderen Bilgileri:<br>\r\n" +
                "                    <strong>ĞÜÖÇıİçğİ SSŞİşöü<br>Ş BBESEE -  1111<br>1233362</strong></p>\r\n" +
                "        <p>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should reveal number regex correctly", async () => {
        const input = {
           "msg": textUtf8ToAsciiArray(
                "          <p>G&ouml;nderen Bilgileri:<br>\r\n" +
                "                    <strong>ĞÜÖÇıİçğİ SSŞİşöü<br>Ş BBESEE -  1111<br>1233362</strong></p>\r\n" +
                "        <p>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textUtf8ToAsciiArray("          <p>G&ouml;nderen Bilgileri:<br>\r\n                    <strong>ĞÜÖÇıİçğİ SSŞİşöü<br>Ş BBESEE -  1111<br>").length).fill("0")
            .concat(textUtf8ToAsciiArray("1233362"))
            .concat(Array(textUtf8ToAsciiArray("</strong></p>\r\n        <p>").length).fill("0"))
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textUtf8ToAsciiArray(
                "          <p>G&ouml;nderen Bilgileri:<br>\r\n" +
                "                    <strong>ĞÜÖÇıİçğİ SSŞİşöü<bl>Ş BBESEE -  1111<br>1233362</strong></p>\r\n" +
                "        <p>"
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});
