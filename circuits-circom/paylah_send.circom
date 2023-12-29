pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
// include "./utils/email_verifier.circom";
include "./stubs/email-verifier.circom";
include "./utils/ceil.circom";
include "./utils/extract.circom";
include "./regexes/common/from_regex_new.circom";
include "./regexes/paylah/paylah_all_regex.circom";
include "./regexes/paylah/paylah_timestamp.circom";
include "./regexes/paylah/paylah_subject.circom";
include "./regexes/paylah/paylah_payment_id.circom";
include "./helpers/paylah_helpers.circom";

template PaylahSendEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    var max_email_from_len = 20; // Length of paylah.alert@dbs.com
    var max_amount_len = 9; // Max 6 fig amount + one decimal point + 2 decimal places. e.g. 999999.00
    var max_payer_mobile_num_len = 4;
    var max_payee_name_len = 35; // Length of "Payee Name: <name>"
    var max_payee_mobile_num_len = 4;
    var max_timestamp_len = 10; // 10 digits till year 2286
    var max_payment_id_len = 21;    // Current transaction reference length 20 + 1 for future proofing

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
    // subject_regex_out === 1;

    // FROM HEADER REGEX
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes];

    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegexNew(max_header_bytes)(in_padded);
    from_regex_out === 1;
    reveal_email_from_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_from_len, pack_size)(from_regex_reveal, email_from_idx);

    // TIMESTAMP REGEX
    var max_timestamp_packed_bytes = count_packed(max_timestamp_len, pack_size);
    assert(max_timestamp_packed_bytes < max_header_bytes);

    signal input email_timestamp_idx;
    signal output reveal_timestamp_packed[max_timestamp_packed_bytes];

    signal timestamp_regex_out, timestamp_regex_reveal[max_header_bytes];
    (timestamp_regex_out, timestamp_regex_reveal) <== PaylahTimestampRegex(max_header_bytes)(in_padded);
    timestamp_regex_out === 1;
    reveal_timestamp_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_timestamp_len, pack_size)(timestamp_regex_reveal, email_timestamp_idx);
    
    // HDFC ONRAMPER ID REGEX
    var max_amount_packed_bytes = count_packed(max_amount_len, pack_size);
    var max_payer_mobile_num_packed_bytes = count_packed(max_payer_mobile_num_len, pack_size);
    var max_payee_name_packed_bytes = count_packed(max_payee_name_len, pack_size);
    var max_payee_mobile_num_packed_bytes = count_packed(max_payee_mobile_num_len, pack_size);

    signal input paylah_amount_idx;
    signal input paylah_payer_mobile_num_idx;
    signal input paylah_payee_name_idx;
    signal input paylah_payee_mobile_num_idx;
    signal output reveal_amount_packed[max_amount_packed_bytes];
    
    signal (
        paylah_regex_out, 
        amount_regex_reveal[max_body_bytes], 
        payer_mobile_num_regex_reveal[max_body_bytes], 
        payee_name_regex_reveal[max_body_bytes], 
        payee_mobile_num_regex_reveal[max_body_bytes]
    ) <== PaylahAllRegex(max_body_bytes)(in_body_padded);

    paylah_regex_out === 1;
    reveal_amount_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_amount_len, pack_size)(amount_regex_reveal, paylah_amount_idx);
    
    // Extract packed and hashed onramper id
    signal input email_to_idx;
    signal output onramper_id <== PaylahOnramperId(
        max_header_bytes, 
        max_body_bytes, 
        pack_size
    )(in_padded, email_to_idx, in_body_padded, paylah_payer_mobile_num_idx, payer_mobile_num_regex_reveal);

    // Hash offramper id
    var max_offramper_id_packed_bytes = max_payee_name_packed_bytes + max_payee_mobile_num_packed_bytes;
    log("max_offramper_id_packed_bytes", max_offramper_id_packed_bytes);
    component hasher = Poseidon(max_offramper_id_packed_bytes);
    assert(max_offramper_id_packed_bytes <= 6);
    for (var i = 0; i < max_payee_name_packed_bytes; i++) {
        hasher.inputs[i] <== payee_name_regex_reveal[i];
    }
    for (var i = 0; i < max_payee_mobile_num_packed_bytes; i++) {
        hasher.inputs[i + max_payee_name_packed_bytes] <== payee_mobile_num_regex_reveal[i];
    }
    signal output offramper_id <== hasher.out;

    // NULLIFIER: PAYMENT ID HASH
    var max_payment_id_packed_bytes = count_packed(max_payment_id_len, pack_size);
    assert(max_payment_id_packed_bytes < max_body_bytes);

    signal input paylah_payment_id_idx;
    signal reveal_payment_id_packed[max_payment_id_packed_bytes];

    signal (payment_regex_out, payment_regex_reveal[max_body_bytes]) <== PaylahPaymentIdRegex(max_body_bytes)(in_body_padded);
    payment_regex_out === 1;
    reveal_payment_id_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_payment_id_len, pack_size)(payment_regex_reveal, paylah_payment_id_idx);

    component hash_payment_id = Poseidon(max_payment_id_packed_bytes);
    for (var i = 0; i < max_payment_id_packed_bytes; i++) {
        hash_payment_id.inputs[i] <== reveal_payment_id_packed[i];
    }
    signal output payment_id_nullifier <== hash_payment_id.out;

    // The following signals do not take part in any computation, but tie the proof to a specific intent_hash & claim_id to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input intent_hash;
    signal intent_hash_squared;
    intent_hash_squared <== intent_hash * intent_hash;

    // TOTAL CONSTRAINTS: 2060123
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 2688 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ intent_hash ] } = PaylahSendEmail(1024, 2240, 121, 17, 7);
