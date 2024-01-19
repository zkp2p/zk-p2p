pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
// include "@zk-email/circuits/email-verifier.circom";
include "./helpers/email-verifier-body.circom";
include "@zk-email/circuits/helpers/extract.circom";

include "../utils/ceil.circom";

template GarantiRegistrationEmailSha(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 2048); // constraints for 2048 bit RSA


    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input modulus[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length

    // Base 64 body hash variables
    signal input body_hash_idx;
    // The precomputed_sha value is the Merkle-Damgard state of our SHA hash up until an index AFTER our first regex match
    // IMPORTANT: This hash must be computed with the rest of the in_body_padded to verify the body hash
    signal input precomputed_sha[32];
    // Suffix of the body after precomputed SHA
    signal input in_body_padded[max_body_bytes];
    // Length of the body after precomputed SHA
    signal input in_body_len_padded_bytes;
    // Precomputed SHA hash of the body packed into 128 bits
    // IMPORTANT: This hash must be checked for witness equivalence in the contract
    signal output intermediate_hash_packed[2];

    //-------BODY HASH VERIFICATION (NO HEADERS)----------//
    component EV = EmailVerifierBody(max_header_bytes, max_body_bytes, n, k, 0);
    EV.in_padded <== in_padded;
    EV.body_hash_idx <== body_hash_idx;
    EV.precomputed_sha <== precomputed_sha;
    EV.in_body_padded <== in_body_padded;
    EV.in_body_len_padded_bytes <== in_body_len_padded_bytes;

    intermediate_hash_packed <== EV.sha_body_packed_out;

    // TODO: PACK INTERMEDIATE HASH INTO 128 BITS TO LOWER CALLDATA
    // component sha_body_packed[2];
    // signal output sha_body_packed_out[2];
    // for (var i = 0; i < 2; i++) {
    //     sha_body_packed[i] = Bits2Num(32);
    //     for (var j = 0; j < 32; j++) {
    //         sha_body_packed[i].in[31 - j] <== sha_body_out[i * 32 + j];
    //     }
    //     sha_body_packed_out[i] <== sha_body_packed[i].out;
    // }

    // TOTAL CONSTRAINTS: X
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 15040 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
// component main = GarantiRegistrationEmail(1024, 15040, 121, 17, 7);
component main = GarantiRegistrationEmailSha(1024, 9408, 121, 17, 7);