import chai from "chai";
import { hdfcReplaceMessageIdWithXGoogleOriginalMessageId } from "../scripts/preprocess_input";

const PREFIX = "Delivered-To: 0xsachink@gmail.com"
const SUFFIX = "DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; s=acls01; d=hdfcbank.net;"

function constructEmail(messageId: string, xGoogleMessageId: string, delimeter = "\n") {
    return `${PREFIX}${delimeter}Message-ID: ${messageId}${delimeter}X-Google-Original-Message-ID: ${xGoogleMessageId}${delimeter}${SUFFIX}${delimeter}`;
}


describe("HDFC send WASM tester", function () {

    describe("when x-google-original-message-id in caps", function () {

        const xGoogleMessageId = "A.1702559867679766244.23077.1156.5.1.0.0.1#0XSACHINK@GMAIL.COM"

        it("Message-ID is not broken", async function () {
            const str = constructEmail(xGoogleMessageId, xGoogleMessageId);
            const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
            const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId);
            chai.expect(returnedString).to.equal(expectedString);
        });

        it("Message-ID is broken and not surrounded with <>", async function () {
            const str = constructEmail("657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com", xGoogleMessageId);
            const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
            const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId);
            chai.expect(returnedString).to.equal(expectedString);
        });

        it("Message-ID is broken and surrounded with <>", async function () {
            const str = constructEmail("<657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com>", xGoogleMessageId);
            const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
            const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId);
            chai.expect(returnedString).to.equal(expectedString);
        });

        describe("when delimeter is \r\n", function () {

            it("Message-ID is not broken", async function () {
                const str = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
                const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                chai.expect(returnedString).to.equal(expectedString);
            });

            it("Message-ID is broken and not surrounded with <>", async function () {
                const str = constructEmail("657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com", xGoogleMessageId, "\r\n");
                const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
                const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                chai.expect(returnedString).to.equal(expectedString);
            });

            it("Message-ID is broken and surrounded with <>", async function () {
                const str = constructEmail("<657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com>", xGoogleMessageId, "\r\n");
                const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
                const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                chai.expect(returnedString).to.equal(expectedString);
            });
        });
    });

    describe("when x-google-original-message-id is in lower letters", function () {

        const xGoogleMessageId = "A.1702559867679766244.23077.1156.5.1.0.0.1#0xsachink@gmail.com"

        it("Message-ID is not broken", async function () {
            const str = constructEmail(xGoogleMessageId, xGoogleMessageId);
            const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
            const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId);
            chai.expect(returnedString).to.equal(expectedString);
        });

        it("Message-ID is broken and not surrounded with <>", async function () {
            const str = constructEmail("657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com", xGoogleMessageId);
            const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
            const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId);
            chai.expect(returnedString).to.equal(expectedString);
        });

        it("Message-ID is broken and surrounded with <>", async function () {
            const str = constructEmail("<657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com>", xGoogleMessageId);
            const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
            const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId);
            chai.expect(returnedString).to.equal(expectedString);
        });

        describe("when delimeter is \r\n", function () {
            it("Message-ID is not broken", async function () {
                const str = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
                const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                chai.expect(returnedString).to.equal(expectedString);
            });

            it("Message-ID is broken and not surrounded with <>", async function () {
                const str = constructEmail("657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com", xGoogleMessageId, "\r\n");
                const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
                const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                chai.expect(returnedString).to.equal(expectedString);
            });

            it("Message-ID is broken and surrounded with <>", async function () {
                const str = constructEmail("<657b007d.650a0220.1a585.45e6SMTPIN_ADDED_BROKEN@mx.google.com>", xGoogleMessageId, "\r\n");
                const returnedString = hdfcReplaceMessageIdWithXGoogleOriginalMessageId(str);
                const expectedString = constructEmail(xGoogleMessageId, xGoogleMessageId, "\r\n");
                chai.expect(returnedString).to.equal(expectedString);
            });
        });
    });
});