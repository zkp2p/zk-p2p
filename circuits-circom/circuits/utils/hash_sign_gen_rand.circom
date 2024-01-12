pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";

// Adapted from email-wallet: https://github.com/zkemail/email-wallet/blob/783700a03b1cb3b07604502c41c2cbcabc87789f/packages/circuits/src/utils/hash_pubkey_and_sign.circom
template HashSignGenRand(n,k) {
    signal input signature[k];

    signal output cm_rand;

    var k2_chunked_size = k >> 1;
    if(k % 2 == 1) {
        k2_chunked_size += 1;
    }

    signal cm_rand_input[k2_chunked_size];
    for(var i = 0; i < k2_chunked_size; i++) {
        if(i==k2_chunked_size-1 && k2_chunked_size % 2 == 1) {
            cm_rand_input[i] <== signature[2*i];
        } else {
            cm_rand_input[i] <== signature[2*i] + (1<<n) * signature[2*i+1];
        }
    }
    cm_rand <== Poseidon(k2_chunked_size)(cm_rand_input);
}