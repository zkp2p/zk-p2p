pragma circom 2.1.5;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/helpers/sha.circom";
include "@zk-email/circuits/helpers/rsa.circom";
include "@zk-email/circuits/helpers/base64.circom";
include "@zk-email/circuits/helpers/extract.circom";
include "@zk-email/zk-regex-circom/circuits/common/body_hash_regex.circom";


// Here, n and k are the biginteger parameters for RSA
// This is because the number is chunked into k pack_size of n bits each
// Max header bytes shouldn't need to be changed much per email,
// but the max mody bytes may need to be changed to be larger if the email has a lot of i.e. HTML formatting
// ignore_body_hash_check is a flag that allows us to skip the body hash check, for projects that dont care about the body contents
// TODO: split into header and body
template EmailVerifierHeader(max_header_bytes, max_body_bytes, n, k, ignore_body_hash_check) {
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

    // Calculate the Poseidon hash of DKIM public key and produce as an output
    // This can be used to verify the public key is correct in contract without requiring the actual key
    // We are converting pub_key (modulus) in to 9 chunks of 242 bits, assuming original n, k are 121 and 17.
    // This is because Posiedon circuit only support array of 16 elements.
    var k2_chunked_size = k >> 1;
    if(k % 2 == 1) {
        k2_chunked_size += 1;
    }
    signal pubkey_hash_input[k2_chunked_size];
    for(var i = 0; i < k2_chunked_size; i++) {
        if(i==k2_chunked_size-1 && k2_chunked_size % 2 == 1) {
            pubkey_hash_input[i] <== pubkey[2*i];
        } else {
            pubkey_hash_input[i] <== pubkey[2*i] + (1<<n) * pubkey[2*i+1];
        }
    }
    pubkey_hash <== Poseidon(k2_chunked_size)(pubkey_hash_input);
}