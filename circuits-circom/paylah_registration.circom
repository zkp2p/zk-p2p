pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
// include "./utils/email_verifier.circom";
include "./stubs/email-verifier.circom";
include "./utils/ceil.circom";
include "./utils/extract.circom";
include "./regexes/common/from_regex.circom";
include "./regexes/paylah/paylah_all_regex.circom";
include "./regexes/paylah/paylah_payer_id.circom";
include "./regexes/paylah/paylah_subject.circom";
include "./helpers/paylah_helpers.circom";

template PaylahRegistrationEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    var max_email_from_len = 20; // Length of paylah.alert@dbs.com
    var max_payer_mobile_num_len = 4;
    
    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input modulus[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length

    // Base 64 body hash variables
    signal input body_hash_idx;
    // The precomputed_sha value is the Merkle-Damgard state of our SHA hash uptil our first regex match which allows us to save SHA constraints by only hashing the relevant part of the body
    signal input precomputed_sha[32];
    // Suffix of the body after precomputed SHA
    signal input in_body_padded[max_body_bytes];
    // Length of the body after precomputed SHA
    signal input in_body_len_padded_bytes;

    signal output modulus_hash;

    // DKIM VERIFICATION
    component EV = EmailVerifier(max_header_bytes, max_body_bytes, n, k, 0);
    EV.in_padded <== in_padded;
    EV.pubkey <== modulus;
    EV.signature <== signature;
    EV.in_len_padded_bytes <== in_len_padded_bytes;
    EV.body_hash_idx <== body_hash_idx;
    EV.precomputed_sha <== precomputed_sha;
    EV.in_body_padded <== in_body_padded;
    EV.in_body_len_padded_bytes <== in_body_len_padded_bytes;

    modulus_hash <== EV.pubkey_hash;

    // PAYLAH SUBJECT REGEX (Check that regex matches)
    signal subject_regex_out <== PaylahSubjectRegex(max_header_bytes)(in_padded);
    subject_regex_out === 1;

    // FROM HEADER REGEX
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes];

    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegex(max_header_bytes)(in_padded);
    // from_regex_out === 1;
    // reveal_email_from_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_from_len, pack_size)(from_regex_reveal, email_from_idx);

    // HDFC ONRAMPER ID REGEX
    var max_payer_mobile_num_packed_bytes = count_packed(max_payer_mobile_num_len, pack_size);
    
    signal input paylah_payer_mobile_num_idx;
    signal (paylah_payer_mobile_num_regex_out, payer_mobile_num_regex_reveal[max_body_bytes]) <== PaylahPayerIdRegex(max_body_bytes)(in_body_padded);

    paylah_payer_mobile_num_regex_out === 1;

    // Extract packed and hashed onramper id
    signal input email_to_idx;
    signal output onramper_id <== PaylahOnramperId(
        max_header_bytes, 
        max_body_bytes, 
        pack_size
    )(in_padded, email_to_idx, in_body_padded, paylah_payer_mobile_num_idx, payer_mobile_num_regex_reveal);

    // TOTAL CONSTRAINTS: X
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 2688 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main = PaylahRegistrationEmail(1024, 2240, 121, 17, 7);
