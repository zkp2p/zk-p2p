pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
// include "./utils/email_verifier.circom";
include "@zk-email/circuits/helpers/extract.circom";
include "./stubs/email-verifier.circom";
include "./utils/ceil.circom";
include "./utils/email_nullifier.circom";
include "./utils/extract.circom";
include "./utils/hash_sign_gen_rand.circom";
include "./regexes/from_regex.circom";
include "./regexes/hdfc/hdfc_amount.circom";
include "./regexes/hdfc/hdfc_date.circom";
include "./regexes/hdfc/hdfc_payee_id.circom";


template HdfcSendEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 1024); // constraints for 1024 bit RSA

    // Rounded to the nearest multiple of pack_size for extra room in case of change of constants
    var max_email_amount_len = 8; // Allowing max 4 fig amount+ one comma  + one decimal point + 2 decimal places. e.g. 2,500.00
    var max_email_from_len = ceil(21, pack_size); // RFC 2821: requires length to be 254, but we can limit to 21 (alerts@hdfcbank.net)
    var max_email_date_len = 31; // Sat, 14 Oct 2023 22:09:12 +0530
    // TODO: CHANGE THIS TO 50.
    var max_payee_len = ceil(42, pack_size);    // Max 50 characters in UPI ID  (TODO: CHANGE THIS TO 50)

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
    signal header_hash[256] <== EV.sha;

    modulus_hash <== EV.pubkey_hash;

    // FROM HEADER REGEX
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes]; // packed into 7-bytes

    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegex(max_header_bytes)(in_padded);
    from_regex_out === 1;
    reveal_email_from_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_from_len, pack_size)(from_regex_reveal, email_from_idx);

    // HDFC SEND AMOUNT REGEX
    var max_email_amount_packed_bytes = count_packed(max_email_amount_len, pack_size);
    assert(max_email_amount_packed_bytes < max_body_bytes);

    signal input hdfc_amount_idx;
    signal output reveal_email_amount_packed[max_email_amount_packed_bytes]; // packed into 7-bytes. TODO: make this rotate to take up even less space

    signal amount_regex_out, amount_regex_reveal[max_body_bytes];
    (amount_regex_out, amount_regex_reveal) <== HdfcAmountRegex(max_body_bytes)(in_body_padded);
    for (var i = 0; i < max_body_bytes; i++) {
        if (amount_regex_reveal[i] != 0) {
            log("amount", amount_regex_reveal[i]);
        }
    }
    amount_regex_out === 1;
    reveal_email_amount_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_email_amount_len, pack_size)(amount_regex_reveal, hdfc_amount_idx);


    // DATE REGEX
    var max_email_date_packed_bytes = count_packed(max_email_date_len, pack_size);
    assert(max_email_date_packed_bytes < max_header_bytes);

    signal input email_date_idx;
    signal output reveal_email_date_packed[max_email_date_packed_bytes]; // packed into 7-bytes

    signal date_regex_out, date_regex_reveal[max_header_bytes];
    (date_regex_out, date_regex_reveal) <== HdfcDateRegex(max_header_bytes)(in_padded);
    for (var i = 0; i < max_header_bytes; i++) {
        if (date_regex_reveal[i] != 0) {
            log("date", date_regex_reveal[i]);
        }
    }
    date_regex_out === 1;

    reveal_email_date_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_date_len, pack_size)(date_regex_reveal, email_date_idx);

    // HDFC SEND PAYEE ID REGEX
    var max_payee_packed_bytes = count_packed(max_payee_len, pack_size); // ceil(max_num_bytes / 7)

    signal input hdfc_payee_id_idx;
    signal reveal_payee_packed[max_payee_packed_bytes];

    signal (payee_regex_out, payee_regex_reveal[max_body_bytes]) <== HdfcPayeeIdRegex(max_body_bytes)(in_body_padded);
    signal is_found_payee <== IsZero()(payee_regex_out);
    for (var i = 0; i < max_body_bytes; i++) {
        if (payee_regex_reveal[i] != 0) {
            log("payee id", payee_regex_reveal[i]);
        }
    }   
    is_found_payee === 0;

    // PACKING
    reveal_payee_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_payee_len, pack_size)(payee_regex_reveal, hdfc_payee_id_idx);

    // HASH OFFRAMPER ID
    component hash = Poseidon(max_payee_packed_bytes);
    assert(max_payee_packed_bytes < 16);
    for (var i = 0; i < max_payee_packed_bytes; i++) {
        hash.inputs[i] <== reveal_payee_packed[i];
    }
    signal output packed_offramper_id_hashed <== hash.out;

    // NULLIFIER
    signal output email_nullifier;
    signal cm_rand <== HashSignGenRand(n, k)(signature);
    email_nullifier <== EmailNullifier()(header_hash, cm_rand);

    // The following signals do not take part in any computation, but tie the proof to a specific intent_hash & claim_id to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input intent_hash;
    signal intent_hash_squared;
    intent_hash_squared <== intent_hash * intent_hash;

    // TOTAL CONSTRAINTS: (WITH STUB): 1156019
    // WITHOUT STUB: TODO
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 3200 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ intent_hash ] } = HdfcSendEmail(1024, 3200, 121, 17, 7);