pragma circom 2.1.5;

include "circomlib/circuits/mimcsponge.circom";
// include "./helpers/sha.circom";

template EmailVerifier(max_header_bytes, max_body_bytes, n, k, ignore_body_hash_check) {
    signal input in_padded[max_header_bytes];
    signal input pubkey[k];
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length

    // Fill it with 256 zeros
    signal output sha[256];
    signal output pubkey_hash;

   
    if (ignore_body_hash_check != 1) {
        signal input body_hash_idx;
        signal input precomputed_sha[32];
        signal input in_body_padded[max_body_bytes];
        signal input in_body_len_padded_bytes;
    }

    // signal output sha[256] <== Sha256Bytes(max_header_bytes)(in_padded, in_len_padded_bytes);

    // Fill random values for outputs
    for (var i = 0; i < 256; i++) {
        sha[i] <== i;
    }

    // Calculate the hash (MIMC) of public key and produce as an output
    // This can be used to verify the public key is correct in contract without requiring the actual key
    component hasher = MiMCSponge(k, 220, 1);
    hasher.ins <== pubkey;
    hasher.k <== 123;
    pubkey_hash <== hasher.outs[0];
}