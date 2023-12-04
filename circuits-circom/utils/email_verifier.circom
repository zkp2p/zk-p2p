pragma circom 2.1.5;

// Imported from: https://github.com/zkemail/zk-email-verify/blob/v2.0.1/packages/circuits/email-verifier.circom
include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/mimcsponge.circom";
include "@zk-email/circuits/helpers/sha.circom";
include "@zk-email/circuits/helpers/rsa.circom";
include "@zk-email/circuits/helpers/base64.circom";
include "../regexes/common/body_hash_regex.circom";
include "./extract.circom";

// Here, n and k are the biginteger parameters for RSA
// This is because the number is chunked into k pack_size of n bits each
// Max header bytes shouldn't need to be changed much per email,
// but the max mody bytes may need to be changed to be larger if the email has a lot of i.e. HTML formatting
// ignore_body_hash_check is a flag that allows us to skip the body hash check, for projects that dont care about the body contents
template EmailVerifier(max_header_bytes, max_body_bytes, n, k, ignore_body_hash_check) {
    assert(max_header_bytes % 64 == 0);
    assert(max_body_bytes % 64 == 0);
    assert(n * k > 2048); // constraints for 2048 bit RSA
    assert(n < (255 \ 2)); // we want a multiplication to fit into a circom signal

    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input pubkey[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length


    // Base 64 body hash variables
    var LEN_SHA_B64 = 44;     // ceil(32 / 3) * 4, due to base64 encoding.

    // SHA HEADER: 506,670 constraints
    // This calculates the SHA256 hash of the header, which is the "base_msg" that is RSA signed.
    // The header signs the fields in the "h=Date:From:To:Subject:MIME-Version:Content-Type:Message-ID;"
    // section of the "DKIM-Signature:"" line, along with the body hash.
    // Note that nothing above the "DKIM-Signature:" line is signed.
    signal output sha[256] <== Sha256Bytes(max_header_bytes)(in_padded, in_len_padded_bytes);
    signal output pubkey_hash;

    var msg_len = (256 + n) \ n;

    component base_msg[msg_len];
    for (var i = 0; i < msg_len; i++) {
        base_msg[i] = Bits2Num(n);
    }
    for (var i = 0; i < 256; i++) {
        base_msg[i \ n].in[i % n] <== sha[255 - i];
    }
    for (var i = 256; i < n * msg_len; i++) {
        base_msg[i \ n].in[i % n] <== 0;
    }

    // VERIFY RSA SIGNATURE: 149,251 constraints
    // The fields that this signature actually signs are defined as the body and the values in the header
    component rsa = RSAVerify65537(n, k);
    for (var i = 0; i < msg_len; i++) {
        rsa.base_message[i] <== base_msg[i].out;
    }
    for (var i = msg_len; i < k; i++) {
        rsa.base_message[i] <== 0;
    }
    rsa.modulus <== pubkey;
    rsa.signature <== signature;


    if (ignore_body_hash_check != 1) {
        signal input body_hash_idx;

        // BODY HASH REGEX: 617,597 constraints
        // This extracts the body hash from the header (i.e. the part after bh= within the DKIM-signature section)
        // which is used to verify the body text matches this signed hash + the signature verifies this hash is legit
        signal (bh_regex_out, bh_reveal[max_header_bytes]) <== BodyHashRegex(max_header_bytes)(in_padded);
        bh_regex_out === 1;
        signal shifted_bh_out[LEN_SHA_B64] <== VarShiftMaskedStr(max_header_bytes, LEN_SHA_B64)(bh_reveal, body_hash_idx);
        // log(body_hash_regex.out);


        // SHA BODY: 760,142 constraints

        // Precomputed sha vars for big body hashing
        // Next 3 signals are for decreasing SHA constraints for parsing out information from the in-body text
        // The precomputed_sha value is the Merkle-Damgard state of our SHA hash uptil our first regex match
        // This allows us to save a ton of SHA constraints by only hashing the relevant part of the body
        // It doesn't have an impact on security since a user must have known the pre-image of a signed message to be able to fake it
        // The lower two body signals describe the suffix of the body that we care about
        // The part before these signals, a significant prefix of the body, has been pre-hashed into precomputed_sha.
        signal input precomputed_sha[32];
        signal input in_body_padded[max_body_bytes];
        signal input in_body_len_padded_bytes;

        // This verifies that the hash of the body, when calculated from the precomputed part forwards,
        // actually matches the hash in the header
        signal sha_body_out[256] <== Sha256BytesPartial(max_body_bytes)(in_body_padded, in_body_len_padded_bytes, precomputed_sha);
        signal sha_b64_out[32] <== Base64Decode(32)(shifted_bh_out);

        // When we convert the manually hashed email sha_body into bytes, it matches the
        // base64 decoding of the final hash state that the signature signs (sha_b64)
        component sha_body_bytes[32];
        for (var i = 0; i < 32; i++) {
            sha_body_bytes[i] = Bits2Num(8);
            for (var j = 0; j < 8; j++) {
                sha_body_bytes[i].in[7 - j] <== sha_body_out[i * 8 + j];
            }
            sha_body_bytes[i].out === sha_b64_out[i];
        }
    }

    // Calculate the hash (MIMC) of public key and produce as an output
    // This can be used to verify the public key is correct in contract without requiring the actual key
    component hasher = MiMCSponge(k, 220, 1);
    hasher.ins <== pubkey;
    hasher.k <== 123;
    pubkey_hash <== hasher.outs[0];
}