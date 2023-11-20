import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Venmo receive ids", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_venmo_receive_id.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_venmo_receive_id"),
                recompile: true,
                verbose: true,
            }
        );
    });

    it("Should generate witnesses", async () => {
        const input = {
            "msg": textToAsciiArray(
                "            <div >\r\n"
                + "                <!-- actor name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=\r\n"
                + "tps://venmo.com/code?user_id=3D1192345678912345678&actor_id=3D27443255215553=\r\n"
                + "45553\">\r\n"
                + "                    Steve A\r\n"
                + "                </a>\r\n"
                + "                <!-- action -->\r\n"
                + "                <span>\r\n"
                + "                    paid\r\n"
                + "                </span>\r\n"
                + "              =20\r\n"
                + "                <!-- recipient name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\""
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
                "            <div >\r\n"
                + "                <!-- actor name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=\r\n"
                + "tps://venmo.com/code?user_id=3D1192345678912345678&actor_id=3D27443255215553=\r\n"
                + "45553\">\r\n"
                + "                    Steve A\r\n"
                + "                </a>\r\n"
                + "                <!-- action -->\r\n"
                + "                <span>\r\n"
                + "                    paid\r\n"
                + "                </span>\r\n"
                + "              =20\r\n"
                + "                <!-- recipient name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\""
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
                "            <div >\r\n"
                + "                <!-- actor name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=\r\n"
                + "tps://venmo.com/code?user_id=3D1192345678912345678&actor_id=3D27443255215553=\r\n"
                + "45553\">\r\n"
                + "                    Steve A\r\n"
                + "                </a>\r\n"
                + "                <!-- action -->\r\n"
                + "                <span>\r\n"
                + "                    paid\r\n"
                + "                </span>\r\n"
                + "              =20\r\n"
                + "                <!-- recipient name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\""
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("            <div >\r\n                <!-- actor name -->\r\n                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=\r\ntps://venmo.com/code?user_id=3D").length).fill("0")
            .concat(textToAsciiArray("1192345678912345678"))
            .concat(textToAsciiArray("&actor_id=3D27443255215553=\r\n45553\">\r\n                    Steve A\r\n                </a>\r\n                <!-- action -->\r\n                <span>\r\n                    paid\r\n                </span>\r\n              =20\r\n                <!-- recipient name -->\r\n                <a style=3D\"color:#0074DE; text-decoration:none\"").fill("0"));
        const result = witness.slice(2, input.msg.length + 2);

        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should reveal second regex correctly", async () => {
        const input = {
            "msg": textToAsciiArray(
                "            <div >\r\n"
                + "                <!-- actor name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=\r\n"
                + "tps://venmo.com/code?user_id=3D1192345678912345678&actor_id=3D27443255215553=\r\n"
                + "45553\">\r\n"
                + "                    Steve A\r\n"
                + "                </a>\r\n"
                + "                <!-- action -->\r\n"
                + "                <span>\r\n"
                + "                    paid\r\n"
                + "                </span>\r\n"
                + "              =20\r\n"
                + "                <!-- recipient name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\""
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );
        const expected = Array(textToAsciiArray("            <div >\r\n                <!-- actor name -->\r\n                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=\r\ntps://venmo.com/code?user_id=3D1192345678912345678&actor_id=3D").length).fill("0")
            .concat(textToAsciiArray("27443255215553=\r\n45553"))
            .concat(textToAsciiArray("\">\r\n                    Steve A\r\n                </a>\r\n                <!-- action -->\r\n                <span>\r\n                    paid\r\n                </span>\r\n              =20\r\n                <!-- recipient name -->\r\n                <a style=3D\"color:#0074DE; text-decoration:none\"").fill("0"));
        const result = witness.slice(input.msg.length + 2, input.msg.length * 2 + 2);
        assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
    });

    it("Should fail to match regex", async () => {
        const input = {
            "msg": textToAsciiArray(
                "            <div >\r\n"
                + "                <!-- actor name -->\r\n"
                + "                <a style=3D\"color:#0074DE; text-decoration:none\" href=3D\"ht=\r\n"
                + "tps://venmo.com/code?user_id=3D1192345678912345678&actor_id=3D27443255215553=\r\n"
                + "45553\">\r\n"
                + "                    Steve A\r\n"
                + "                </a>\r\n"
                + "                <!-- action -->\r\n"
                + "                <span>\r\n"
                + "                    paid\r\n"
                + "                </span>\r\n"
                + "              =20\r\n"
                + "                <!-- rpcipient name -->\r\n" // update to p
                + "                <a style=3D\"color:#0074DE; text-decoration:none\""
            )
        };
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    });
});
