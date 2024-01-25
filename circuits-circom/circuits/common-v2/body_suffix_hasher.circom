pragma circom 2.1.5;

include "@zk-email/circuits/helpers/sha.circom";
include "@zk-email/circuits/helpers/extract.circom";

template BodySuffixHasher(max_body_suffix_bytes) {
    assert(max_body_suffix_bytes % 64 == 0);

    //-------Signals----------//

    // The intermediate_hash value is the Merkle-Damgard state of our SHA hash until the body cutoff point
    signal input intermediate_hash[32];
    // Suffix of the body after precomputed SHA
    signal input in_body_suffix_padded[max_body_suffix_bytes];
    // Length of the body after precomputed SHA
    signal input in_body_suffix_len_padded_bytes;
    
    //-------Hash Body Suffix----------//

    signal body_hash_bits[256] <== Sha256BytesPartial(max_body_suffix_bytes)(in_body_suffix_padded, in_body_suffix_len_padded_bytes, intermediate_hash);

    component bits2Num[32];
    signal body_hash_bytes[32];
    for (var i = 0; i < 32; i++) {
        bits2Num[i] = Bits2Num(8);
        for (var j = 0; j < 8; j++) {
            bits2Num[i].in[7 - j] <== body_hash_bits[i * 8 + j];
        }
        body_hash_bytes[i] <== bits2Num[i].out;
    }
    
    //-------Packing For Calldata----------//
    
    signal output intermediate_hash_packed[2] <== PackBytes(32, 2, 16)(intermediate_hash);
    signal output body_hash_packed[2] <== PackBytes(32, 2, 16)(body_hash_bytes);
}