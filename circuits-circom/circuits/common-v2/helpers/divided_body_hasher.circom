pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/helpers/sha.circom";
include "@zk-email/circuits/helpers/base64.circom";

template DividedBodyHasher(max_body_bytes) {
    assert(max_body_bytes % 64 == 0);

    // Base 64 body hash variables
    var LEN_SHA_B64 = 44;

    //-------SIGNALS----------//

    signal input body_hash_b64[LEN_SHA_B64];
    // The precomputed_sha value is the Merkle-Damgard state of our SHA hash up until an index AFTER our first regex match
    signal input precomputed_sha[32];
    // Suffix of the body after precomputed SHA
    signal input in_body_padded[max_body_bytes];
    // Length of the body after precomputed SHA
    signal input in_body_len_padded_bytes;
    // Precomputed SHA hash of the body packed into 128 bits
    signal output precomputed_sha_packed[2];
    // Body hash packed into 128 bits
    signal output body_hash_packed[2];

    //-------BODY HASH VERIFICATION----------//

    // This verifies that the hash of the body, when calculated from the precomputed part forwards,
    // actually matches the hash in the header
    signal sha_body_out[256] <== Sha256BytesPartial(max_body_bytes)(in_body_padded, in_body_len_padded_bytes, precomputed_sha);

    // Decode the body hash from base64
    signal sha_b64_out[32] <== Base64Decode(32)(body_hash_b64);

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
    
    //-------PACKING FOR CALLDATA----------//
    
    component precomputed_sha_packer[2];
    for (var i = 0; i < 2; i++) {
        precomputed_sha_packer[i] = Bytes2Packed(16);
        for (var j = 0; j < 16; j++) {
            var idx = i * 16 + j;
            precomputed_sha_packer[i].in[j] <== precomputed_sha[i * 16 + j];
        }
        precomputed_sha_packed[i] <== precomputed_sha_packer[i].out;
        log("precomputed_sha_packed", precomputed_sha_packed[i]);
    }

    component body_hash_packer[2];
    for (var i = 0; i < 2; i++) {
        body_hash_packer[i] = Bytes2Packed(16);
        for (var j = 0; j < 16; j++) {
            var idx = i * 16 + j;
            body_hash_packer[i].in[j] <== sha_b64_out[i * 16 + j];
        }
        body_hash_packed[i] <== body_hash_packer[i].out;
        log("body_hash_packed", body_hash_packed[i]);
    }    
}