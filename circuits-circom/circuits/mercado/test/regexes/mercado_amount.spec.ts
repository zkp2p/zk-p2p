import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');
const MIN_LEN = 40;     // Lo=\r\ns =\r\n =\r\n $=\r\n 123=\r\n456 =\r\n qu=\r\ne   // 54 - 14 = 40

describe("Mercado Amount Regex", () => {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_mercado_amount.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_mercado_amount"),
                recompile: true,
                verbose: true,
            }
        );
    });

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    function textToAsciiArrayPadded(text: string, padChar: string = " "): string[] {
        while (text.length < MIN_LEN) {
            text += padChar;
        }
        return textToAsciiArray(text);
    }

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("Lo=\r\ns =\r\n $=\r\n 123=\r\n456 qu=\r\ne")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    describe("Should match regex once", () => {

        it("Los $ 123456 que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los $ 123456 que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456 que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("L=os = $ 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("L=\r\nos =\r\n $ 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Lo=s = $ 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Lo=\r\ns =\r\n $ 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los= = $ 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los=\r\n =\r\n $ 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = = $ 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n =\r\n $ 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = =$ 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n =\r\n$ 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $= 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $=\r\n 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ =123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ =\r\n123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123=456 que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123=\r\n456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456= que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456=\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456 = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456 = = que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\n =\r\n que")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456 =que", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\nque")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456 = q=ue", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\n q=\r\nue")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Los = $ 123456 = qu=e", async () => {
            const input = {
                "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\n qu=\r\ne")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });
    });

    it("should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\n que")  // Pad with e's
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        const expected = Array(textToAsciiArray("Los =\r\n $ ").length).fill("0")  // 10
            .concat(textToAsciiArray("123456")) // 6
            .concat(textToAsciiArray(" =\r\n que").fill("0"))    // 8
            .concat(Array(16).fill("0"))    // 40 - 10 - 6 - 8 = 16
        const result = witness.slice(2, input.msg.length + 2);
        console.log(witness);
        console.log(JSON.stringify(result))

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("should reveal regex correctly", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("Los =\r\n $ 123=\r\n456 =\r\n que")  // Pad with e's
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        const expected = Array(textToAsciiArray("Los =\r\n $ ").length).fill("0")  // 10
            .concat(textToAsciiArray("123=\r\n456")) // 9
            .concat(textToAsciiArray(" =\r\n que").fill("0"))    // 8
            .concat(Array(13).fill("0"))    // 40 - 10 - 9 - 8 = 13
        const result = witness.slice(2, input.msg.length + 2);
        console.log(witness);
        console.log(JSON.stringify(result))

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArrayPadded("Los =\r\n $ 123456 =\r\n QUE")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});