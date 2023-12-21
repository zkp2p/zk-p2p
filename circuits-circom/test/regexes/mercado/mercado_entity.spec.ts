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

        it("Entidad: =<=strong> Mercado Pago", async () => {
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
                "msg": textToAsciiArray("Entidad: =\r\n <st=\r\nrong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <str=ong> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <str=\r\nong> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <stro=ng> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <stro=\r\nng> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <stron=g> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <stron=\r\ng> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong=> Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong=\r\n> Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong>= Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong>=\r\n Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> =Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\nMercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\n Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = =Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\n =\r\nMercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\n =\r\n Mercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = M=ercado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> =\r\n =\r\n M=\r\nercado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Me=rcado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> =\r\n =\r\n Me=\r\nrcado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mer=cado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> =\r\n =\r\n Mer=\r\ncado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Merc=ado Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> =\r\n =\r\n Merc=\r\nado Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mercad=o Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> =\r\n =\r\n Mercad=\r\no Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mercado= Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n <strong> =\r\n =\r\n Mercado=\r\n Pago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mercado =Pago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\n =\r\n Mercado =\r\nPago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mercado P=ago", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\n =\r\n Mercado P=\r\nago")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mercado Pa=go", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\n =\r\n Mercado Pa=\r\ngo")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Entidad: = <strong> = = Mercado Pag=o", async () => {
            const input = {
                "msg": textToAsciiArray("Entidad: =\r\n<strong> =\r\n =\r\n Mercado Pag=\r\no")
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
            "msg": textToAsciiArray("Entity: <strong> Mercado Pago")
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});