import chai from "chai";
import path from "path";
import { F1Field, Scalar } from "ffjavascript";

export const p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(p);

const assert = chai.assert;

const wasm_tester = require("circom_tester").wasm;

const fs = require('fs');

describe("Body Hash Regex V2", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let cir;

    function textToAsciiArray(text: string): string[] {
        return Array.from(text).map(char => char.charCodeAt(0).toString());
    }

    beforeAll(async () => {
        cir = await wasm_tester(
            path.join(__dirname, "../mocks/test_body_hash_regex_v2.circom"),
            {
                include: path.join(__dirname, "../../node_modules"),
                output: path.join(__dirname, "../../build/test_body_hash_regex_v2"),
                recompile: true,
                verbose: true,
            }
        );
    });

    describe("when canonicalization is simple/simple", () => {
        it("Should generate witnesses", async () => {
            const input = {
                "msg": textToAsciiArray("\r\nDKIM-Signature: v=1; a=rsa-sha256;\tq=dns/txt;\tc=simple/simple;\r\n\ts=ylavq3ml4jl4lt6dltbgmnoftxftkly; d=gggg.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date;\tbh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
    
            assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        });

        it("Should match regex once", async () => {
            const input = {
                "msg": textToAsciiArray("\r\nDKIM-Signature: v=1; a=rsa-sha256;\tq=dns/txt;\tc=simple/simple;\r\n\ts=ylavq3ml4jl4lt6dltbgmnoftxftkly; d=gggg.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date;\tbh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Should match regex once", async () => {
            const input = {
                "msg": textToAsciiArray("\r\nDKIM-Signature: v=1;\r\n\ta=rsa-sha256;\r\n d=info.garantibbva.com.tr;\r\n\ts=BulkMailSelector1;\r\n\tc=simple/simple;\r\n\tq=dns/txt;\r\n i=@info.garantibbva.com.tr;\r\n\tt=1703416861; h=from:subject:to:cc;\r\n\tbh=gmhfwkcqvc0+z9C9jn4s7JtbkCL8Bc6ysyMgln+cHH0=;\r\n b=123")
            };

            const witness = await cir.calculateWitness(
                input,
                true
            );

            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });

        it("Should reveal regex correctly", async () => {
            const input = {
                "msg": textToAsciiArray("\r\nDKIM-Signature: v=1; a=rsa-sha256;\tq=dns/txt;\tc=simple/simple;\r\n\ts=ylavq3ml4jl4lt6dltbgmnoftxftkly; d=gggg.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date;\tbh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            const expected = Array(textToAsciiArray("\r\nDKIM-Signature: v=1; a=rsa-sha256;\tq=dns/txt;\tc=simple/simple;\r\n\ts=ylavq3ml4jl4lt6dltbgmnoftxftkly; d=gggg.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date;\tbh=").length).fill("0")
                .concat(textToAsciiArray("C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI="))
                .concat(textToAsciiArray("; b=").fill("0"));
            const result = witness.slice(2, 249 + 2);

            assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
        });

        it("Should fail to match regex (only one half of new line)", async () => {
            // Because we only allow 1 D or d
            const input = {
                "msg": textToAsciiArray("\r\nDKIM-Signature: v=1; a=rsa-sha256; q=dns/txt; c=simple/simple; s=ylavq3ml4jl4lt6dltbgmnoftxftkly; d=gggg.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date;\r\tbh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=1")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
    
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
        });
        
        it("Should fail to match regex (no space or tab after new line)", async () => {
            // Because we only allow 1 D or d
            const input = {
                "msg": textToAsciiArray("\r\nDKIM-Signature: v=1; a=rsa-sha256; q=dns/txt; c=simple/simple; s=ylavq3ml4jl4lt6dltbgmnoftxftkly; d=gggg.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date;\r\nbh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=1")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
    
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
        });
    });

    describe("when canonicalization is relaxed", () => {
        it("Should generate witnesses", async () => {
            const input = {
                "msg": textToAsciiArray("\r\ndkim-signature:v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple; s=yzlavq3ml4jl4lt6dltbgmnoftxftkly; d=venmo.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date; bh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
    
            assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        });
    
        it("Should match regex once", async () => {
            const input = {
                "msg": textToAsciiArray("\r\ndkim-signature:v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple; s=yzlavq3ml4jl4lt6dltbgmnoftxftkly; d=venmo.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date; bh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
        });
    
        it("Should reveal regex correctly", async () => {
            const input = {
                "msg": textToAsciiArray("\r\ndkim-signature:v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple; s=yzlavq3ml4jl4lt6dltbgmnoftxftkly; d=venmo.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date; bh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
            const expected = Array(textToAsciiArray("\r\ndkim-signature:v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple; s=yzlavq3ml4jl4lt6dltbgmnoftxftkly; d=venmo.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date; bh=").length).fill("0")
                .concat(textToAsciiArray("C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI="))
                .concat(textToAsciiArray("; b=").fill("0"));
            const result = witness.slice(2, 249 + 2);
    
            assert.equal(JSON.stringify(result), JSON.stringify(expected), true);
        });
    
        it("Should fail to match regex", async () => {
            const input = {
                "msg": textToAsciiArray("\n\rdkim-signature:v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple; s=yzlavq3ml4jl4lt6dltbgmnoftxftkly; d=venmo.com; t=1698260687; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date; bh=C9JrSSzQ+HxrQ6y65Bb/5BE511a00wfrddEQySR9PLI=; b=")
            };
            const witness = await cir.calculateWitness(
                input,
                true
            );
    
            assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
        });
    });
});