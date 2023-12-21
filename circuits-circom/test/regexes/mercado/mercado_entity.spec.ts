import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');
const MIN_LEN = 46;     // Entid=\r\nad: =\r\n <stro=\r\ng> =\r\n Mer=\r\ncado Pago    // 56 - 10 = 46

describe("Mercado Entity Regex", () => {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../../mocks/mercado/test_mercado_entity.circom"),
            {
                include: path.join(__dirname, "../../../node_modules"),
                output: path.join(__dirname, "../../../build/test_mercado_entity"),
                recompile: true,
                verbose: true,
            }
        );
    });

    function textToAsciiArray(text: string): string[] {
        while (text.length < MIN_LEN) {
            text += " ";
        }
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArray("Entidad: <strong>")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    });

    describe("Should match regex once", () => {

        it("Entidad: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("E=ntidad: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("E=\r\nntidad: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("En=tidad: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("En=\r\ntidad: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Ent=idad: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Ent=\r\nidad: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Enti=dad: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Enti=\r\ndad: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entid=ad: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entid=\r\nad: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entida=d: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entida=\r\nd: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad=: <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad=\r\n: <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: =<strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <=strong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <=\r\nstrong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <s=trong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <st=rong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<st=\r\nrong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray("Entity: <strong>")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});