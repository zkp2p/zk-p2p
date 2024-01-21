pragma circom 2.1.5;

include "@zk-email/circuits/helpers/sha.circom";

template DividedHasher(max_body_bytes) {
    assert(max_body_bytes % 64 == 0);

    //-------SIGNALS----------//

    signal input expected_sha[32];
    // The precomputed_sha value is the Merkle-Damgard state of our SHA hash up until an index AFTER our first regex match
    signal input precomputed_sha[32];
    // Suffix of the body after precomputed SHA
    signal input in_body_padded[max_body_bytes];
    // Length of the body after precomputed SHA
    signal input in_body_len_padded_bytes;
    // Precomputed SHA hash of the body packed into 128 bits
    signal output precomputed_sha_packed[2];
    // Body hash packed into 128 bits
    signal output expected_hash_packed[2];

    //-------HASH PREIMAGE VERIFICATION----------//

    signal sha_body_out[256] <== Sha256BytesPartial(max_body_bytes)(in_body_padded, in_body_len_padded_bytes, precomputed_sha);

    component sha_body_bytes[32];
    for (var i = 0; i < 32; i++) {
        sha_body_bytes[i] = Bits2Num(8);
        for (var j = 0; j < 8; j++) {
            sha_body_bytes[i].in[7 - j] <== sha_body_out[i * 8 + j];
        }
        sha_body_bytes[i].out === expected_sha[i];
    }
    
    //-------PACKING FOR CALLDATA----------//
    
    component precomputed_sha_packer[2];
    for (var i = 0; i < 2; i++) {
        precomputed_sha_packer[i] = Bytes2Packed(16);
        for (var j = 0; j < 16; j++) {
            var idx = i * 16 + j;
            precomputed_sha_packer[i].in[j] <== precomputed_sha[i * 16 + j];
        }
        precomputed_sha_packed[i] <== precomputed_sha_packer[i].out;
    }

    component expected_hash_packer[2];
    for (var i = 0; i < 2; i++) {
        expected_hash_packer[i] = Bytes2Packed(16);
        for (var j = 0; j < 16; j++) {
            var idx = i * 16 + j;
            expected_hash_packer[i].in[j] <== expected_sha[i * 16 + j];
        }
        expected_hash_packed[i] <== expected_hash_packer[i].out;
    }    
}