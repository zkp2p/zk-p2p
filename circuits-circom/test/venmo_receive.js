const chai = require("chai");
const path = require("path");
const crypto = require("crypto");
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

function buffer2bitArray(b) {
    const res = [];
    for (let i=0; i<b.length; i++) {
        for (let j=0; j<8; j++) {
            res.push((b[i] >> (7-j) &1));
        }
    }
    return res;
}

function bitArray2buffer(a) {
    const len = Math.floor((a.length -1 )/8)+1;
    const b = new Buffer.alloc(len);

    for (let i=0; i<a.length; i++) {
        const p = Math.floor(i/8);
        b[p] = b[p] | (Number(a[i]) << ( 7 - (i%8)  ));
    }
    return b;
}

describe("Venmo receive test", function () {
    this.timeout(100000);

    let cir;

    before( async() => {
        cir = await wasm_tester(
            path.join(__dirname, "../venmo_receive.circom"),
            {
                include: path.join(__dirname, "../node_modules"),
                output: path.join(__dirname, "../build/venmo_receive"),
                recompile: false, // setting this to true will recompile the circuit (~3-5min)
                verbose: true,
            }
        );
    });

    it("Should work bits to array and array to bits", async () => {
        const b = new Buffer.alloc(64);
        for (let i=0; i<64; i++) {
            b[i] = i+1;
        }
        const a = buffer2bitArray(b);
        const b2 = bitArray2buffer(a);

        assert.equal(b.toString("hex"), b2.toString("hex"), true);
    });

    it("Should generate witnesses", async () => {
        // To preserve privacy of emails, load inputs generated using `yarn gen-input`. Ping us if you want an example venmo_receive.eml to run tests 
        // Otherwise, you can download the original eml from any Venmo receive payment transaction
        const venmo_path = path.join(__dirname, "../inputs/input_venmo_receive.json");
        const jsonString = fs.readFileSync(venmo_path, "utf8");
        const input = JSON.parse(jsonString);
        const witness = await cir.calculateWitness(
            input,
            true
        );

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        // TODO: Add more tests
    }).timeout(1000000);
});