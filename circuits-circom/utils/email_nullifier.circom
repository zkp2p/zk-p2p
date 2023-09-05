pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";

// Adapted from email-wallet https://github.com/zkemail/email-wallet
template EmailNullifier() {
    signal input header_hash[256];

    signal output email_nullifier;

    var field_pack_bits = 248;

    // Pack header hash into 1 int of 248 bits
    signal header_hash_int[field_pack_bits+1];
    header_hash_int[0] <== 0;
    for(var i = 0; i < field_pack_bits; i++) {
        header_hash_int[i+1] <== 2 * header_hash_int[i] + header_hash[i];
    }
    email_nullifier <== header_hash_int[field_pack_bits];
}