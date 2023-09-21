pragma circom 2.1.5;

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

    // Fill random values for outputs
    for (var i = 0; i < 256; i++) {
        sha[i] <== i;
    }
    pubkey_hash <== 1234;
}