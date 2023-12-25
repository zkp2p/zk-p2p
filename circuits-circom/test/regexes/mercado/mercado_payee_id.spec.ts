import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;


// CVU: =
// =
// <strong> =
// =
// 0000003100097214822524

// TODO: HOW TO LIMIT THE CVU TO 22 CHARS?

const fs = require('fs');
const MIN_LEN = 61;     // C=\r\nVU: =\r\n= \r\n <stron=\r\ng> =\r\n =\r\n 000000310009=\r\n7214822524   // 73 - 12 = 61

describe("Mercado Payee ID Regex", () => {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../../mocks/mercado/test_mercado_payee_id.circom"),
            {
                include: path.join(__dirname, "../../../node_modules"),
                output: path.join(__dirname, "../../../build/test_mercado_payee_id"),
                recompile: true,
                verbose: true,
            }
        );
    });

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    function textToAsciiArrayPadded(text: string): string[] {
        while (text.length < MIN_LEN) {
            text += " ";
        }
        return textToAsciiArray(text);
    }

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("CVU: =\r\n =\r\n <strong> =\r\n =\r\n 0000003100097214822524")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    describe("Should match regex once", () => {

        it("C=VU: = <strong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("C=\r\nVU: =\r\n <strong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CV=U: = <strong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CV=\r\nU: =\r\n <strong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU=: = <strong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU=\r\n: =\r\n <strong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU:= = <strong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU:=\r\n =\r\n <strong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = <=strong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n <=\r\nstrong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = <s=trong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n <s=\r\ntrong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = <st=rong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n <st=\r\nrong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = <str=ong> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n <str=\r\nong> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = <stro=ng> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n <stro=\r\nng> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = <stron=g> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n <stron=\r\ng> =\r\n =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = <strong=> = = 0000003100097214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n <strong=\r\n> =\r\n 0000003100097214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("CVU: = = <strong> = = 000000310009=\r\n7214822524", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("CVU: =\r\n =\r\n <strong> =\r\n =\r\n 000000310009=\r\n7214822524")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });
    });

    it.skip("should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("CVU: =\r\n =\r\n <strong> =\r\n =\r\n 0000003100097214822524")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // TODO: Fix this. For some reason, the =\r\n =\r\n right before digits are also being revealed.
        const expected = Array(textToAsciiArray("CVU: =\r\n =\r\n <strong> =\r\n =\r\n ").length).fill("0")  // 38 - 8 = 30
            .concat(textToAsciiArray("0000003100097214822524")) // 22
            .concat(Array(9).fill("0"))    // 61 - 30 - 22 = 9
        const result = witness.slice(2, input.msg.length + 2);
        console.log(witness);
        console.log(JSON.stringify(result))

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it.skip("should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("CVU: =\r\n =\r\n <strong> =\r\n =\r\n 000000310009=\r\n7214822524")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        // TODO: Fix this. For some reason, the =\r\n =\r\n right before digits are also being revealed.
        const expected = Array(textToAsciiArray("CVU: =\r\n =\r\n <strong> =\r\n =\r\n ").length).fill("0")  // 38 - 8 = 30
            .concat(textToAsciiArray("000000310009=\r\n7214822524")) // 25
            .concat(Array(6).fill("0"))    // 61 - 30 - 25 = 6
        const result = witness.slice(2, input.msg.length + 2);
        console.log(witness);
        console.log(JSON.stringify(result))

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("CBU: =\r\n =\r\n <strong> =\r\n =\r\n 0000003100097214822524")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});
