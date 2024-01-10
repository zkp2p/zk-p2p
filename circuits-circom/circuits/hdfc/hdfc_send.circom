pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "../utils/ceil.circom";

include "./utils/email_verifier.circom";
include "./utils/extract.circom";
include "./helpers/hdfc_helpers.circom";
include "./regexes/hdfc_amount.circom";
include "./regexes/hdfc_date.circom";
include "./regexes/hdfc_upi_subject.circom";
include "./regexes/hdfc_payment_id.circom";

template HdfcSendEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    var max_email_from_len = 21; // Length of alerts@hdfcbank.net
    var max_email_date_len = 31; // Sat, 14 Oct 2023 22:09:12 +0530
    var max_amount_len = 9; // Max UPI transaction size is ₹1 Lakh. Max 6 fig amount + one decimal point + 2 decimal places. e.g. 999999.00
    var max_payment_id_len = 14; // Current payment ID length is 12, but account for 2 extra bytes for future proofing

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

    // HDFC UPI EMAIL VERIFICATION REGEX (Check that regex matches)
    signal upi_subject_regex_out <== HdfcUpiSubjectRegex(max_header_bytes)(in_padded);
    upi_subject_regex_out === 1;

    // FROM HEADER REGEX
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes]; // packed into 7-bytes

    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegex(max_header_bytes)(in_padded);
    from_regex_out === 1;
    reveal_email_from_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_from_len, pack_size)(from_regex_reveal, email_from_idx);

    // HDFC SEND AMOUNT REGEX
    var max_email_amount_packed_bytes = count_packed(max_amount_len, pack_size);
    assert(max_email_amount_packed_bytes < max_body_bytes);

    signal input hdfc_amount_idx;
    signal output reveal_email_amount_packed[max_email_amount_packed_bytes]; // packed into 7-bytes. TODO: make this rotate to take up even less space

    signal (amount_regex_out, amount_regex_reveal[max_body_bytes]) <== HdfcAmountRegex(max_body_bytes)(in_body_padded);
    amount_regex_out === 1;
    reveal_email_amount_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_amount_len, pack_size)(amount_regex_reveal, hdfc_amount_idx);

    // DATE REGEX
    var max_email_date_packed_bytes = count_packed(max_email_date_len, pack_size);
    assert(max_email_date_packed_bytes < max_header_bytes);

    signal input email_date_idx;
    signal output reveal_email_date_packed[max_email_date_packed_bytes]; // packed into 7-bytes

    signal (date_regex_out, date_regex_reveal[max_header_bytes]) <== HdfcDateRegex(max_header_bytes)(in_padded);
    date_regex_out === 1;
    reveal_email_date_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_date_len, pack_size)(date_regex_reveal, email_date_idx);

    // HDFC ONRAMPER ID REGEX

    // Extract packed and hashed onramper id
    signal input email_to_idx;
    signal input hdfc_acc_num_idx;
    signal output onramper_id <== HdfcOnramperId(
        max_header_bytes, 
        max_body_bytes, 
        pack_size
    )(in_padded, email_to_idx, in_body_padded, hdfc_acc_num_idx);

    // Extract packed and hashed offramper id
    signal input hdfc_payee_id_idx;
    signal output offramper_id <== HdfcOfframperId(
        max_body_bytes, 
        pack_size
    )(in_body_padded, hdfc_payee_id_idx);

    // NULLIFIER: PAYMENT ID HASH
    var max_payment_id_packed_bytes = count_packed(max_payment_id_len, pack_size);
    assert(max_payment_id_packed_bytes < max_body_bytes);

    signal input hdfc_payment_id_idx;
    signal reveal_payment_id_packed[max_payment_id_packed_bytes]; // packed into 7-bytes

    signal (payment_regex_out, payment_regex_reveal[max_body_bytes]) <== HdfcPaymentIdRegex(max_body_bytes)(in_body_padded);
    payment_regex_out === 1;
    reveal_payment_id_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_payment_id_len, pack_size)(payment_regex_reveal, hdfc_payment_id_idx);
    
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

    // TOTAL CONSTRAINTS: 5871794
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 4352 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ intent_hash ] } = HdfcSendEmail(1024, 4352, 121, 17, 7);
