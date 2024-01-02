pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "./utils/email_verifier.circom";
include "./utils/ceil.circom";
include "./utils/extract.circom";
include "./regexes/common/from_regex_v2.circom";
include "./regexes/common/to_regex.circom";
include "./regexes/paylah/paylah_payment_details.circom";
include "./regexes/paylah/paylah_timestamp.circom";
include "./regexes/paylah/paylah_subject.circom";
include "./regexes/paylah/paylah_payment_id.circom";

template PaylahSendEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    //-------EMAIL VERIFICATION----------//

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

    //-------CONSTANTS----------//

    var max_email_from_len = 20; // Length of paylah.alert@dbs.com
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    var max_email_to_len = 49;  // RFC 2821: requires length to be 254, but 49 is safe max length of email to field (https://atdata.com/long-email-addresses/)
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);

    var max_timestamp_len = 10; // 10 digits till year 2286
    var max_timestamp_packed_bytes = count_packed(max_timestamp_len, pack_size);
    assert(max_timestamp_packed_bytes < max_header_bytes);

    var max_amount_len = 7; // Max 4 fig amount + one decimal point + 2 decimal places. e.g. 999999.00
    var max_amount_packed_bytes = count_packed(max_amount_len, pack_size);
    assert(max_amount_packed_bytes < max_body_bytes);

    var max_payer_mobile_num_len = 4;
    var max_payer_mobile_num_packed_bytes = count_packed(max_payer_mobile_num_len, pack_size);
    assert(max_payer_mobile_num_packed_bytes < max_body_bytes);

    var max_payee_name_len = 35; // Max length of payee alias / name
    var max_payee_name_packed_bytes = count_packed(max_payee_name_len, pack_size);
    assert(max_payee_name_packed_bytes < max_body_bytes);

    var max_payee_mobile_num_len = 4;
    var max_payee_mobile_num_packed_bytes = count_packed(max_payee_mobile_num_len, pack_size);
    assert(max_payee_mobile_num_packed_bytes < max_body_bytes);
    
    var max_payment_id_len = 28; // Current transaction reference length 20 + 8 for future proofing
    var max_payment_id_packed_bytes = count_packed(max_payment_id_len, pack_size);
    assert(max_payment_id_packed_bytes < max_body_bytes);

    //-------REGEXES----------//

    // Paylah subject regex
    signal subject_regex_out <== PaylahSubjectRegex(max_header_bytes)(in_padded);
    subject_regex_out === 1;

    // From regex v2
    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegexV2(max_header_bytes)(in_padded);
    from_regex_out === 1;
    
    // To regex
    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegex(max_header_bytes)(in_padded);
    to_regex_out === 1;

    // Paylah timestamp regex
    signal (timestamp_regex_out, timestamp_regex_reveal[max_header_bytes]) <== PaylahTimestampRegex(max_header_bytes)(in_padded);
    timestamp_regex_out === 1;

    // Paylah payment details regex
    signal (
        paylah_regex_out, 
        amount_regex_reveal[max_body_bytes], 
        payer_mobile_num_regex_reveal[max_body_bytes], 
        payee_name_regex_reveal[max_body_bytes], 
        payee_mobile_num_regex_reveal[max_body_bytes]
    ) <== PaylahPaymentDetailsRegex(max_body_bytes)(in_body_padded);
    paylah_regex_out === 1;

    // Paylah payment id regex
    signal (payment_regex_out, payment_regex_reveal[max_body_bytes]) <== PaylahPaymentIdRegex(max_body_bytes)(in_body_padded);
    payment_regex_out === 1;

    //-------BUSINESS LOGIC----------//

    // Output packed from
    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_email_from_len, 
        pack_size
    )(from_regex_reveal, email_from_idx);

    // Packed to (Not an output. Used to compute onramper id)
    signal input email_to_idx;
    signal reveal_email_to_packed[max_email_to_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_email_to_len, 
        pack_size
    )(to_regex_reveal, email_to_idx);

    // Output packed timestamp
    signal input email_timestamp_idx;
    signal output reveal_timestamp_packed[max_timestamp_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_timestamp_len, 
        pack_size
    )(timestamp_regex_reveal, email_timestamp_idx);
    
    // Output packed amount
    signal input paylah_amount_idx;
    signal output reveal_amount_packed[max_amount_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_amount_len, 
        pack_size
    )(amount_regex_reveal, paylah_amount_idx);

    // Packed payer mobile number (Not an output. Used to compute onramper id)
    signal input paylah_payer_mobile_num_idx;
    signal reveal_payer_mobile_num_packed[max_payer_mobile_num_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payer_mobile_num_len, 
        pack_size
    )(payer_mobile_num_regex_reveal, paylah_payer_mobile_num_idx);

    // Packed payee name (Not an output. Used to compute offramper id)
    signal input paylah_payee_name_idx;
    signal reveal_payee_name_packed[max_payee_name_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payee_name_len, 
        pack_size
    )(payee_name_regex_reveal, paylah_payee_name_idx);
    
    // Packed payee mobile number (Not an output. Used to compute offramper id)
    signal input paylah_payee_mobile_num_idx;
    signal reveal_payee_mobile_num_packed[max_payee_mobile_num_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payee_mobile_num_len, 
        pack_size
    )(payee_mobile_num_regex_reveal, paylah_payee_mobile_num_idx);

    // Packed payment id (Not an output. Used to compute payment id nullifier)
    signal input paylah_payment_id_idx;
    signal reveal_payment_id_packed[max_payment_id_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payment_id_len, 
        pack_size
    )(payment_regex_reveal, paylah_payment_id_idx);

    //-------ONRAMPER_ID, OFFRAMPER_ID, NULLIFIER----------//

    // Output hashed onramper id = hash(to_packed + payer_mobile_num_packed)
    assert(max_email_to_packed_bytes == 7);
    assert(max_payer_mobile_num_packed_bytes == 1);
    component hash1 = Poseidon(6);
    for (var i = 0; i < 6; i++) {
        hash1.inputs[i] <== reveal_email_to_packed[i];
    }
    component hash2 = Poseidon(3);
    hash2.inputs[0] <== hash1.out;
    hash2.inputs[1] <== reveal_email_to_packed[6];
    hash2.inputs[2] <== reveal_payer_mobile_num_packed[0];
    signal output on_ramper_id <== hash2.out;

    // Output hashed offramper id = hash(payee_name_packed + payee_mobile_num_packed)
    assert(max_payee_name_packed_bytes == 5);
    assert(max_payee_mobile_num_packed_bytes == 1);
    component hash_offramper_id = Poseidon(6);
    for (var i = 0; i < 5; i++) {
        hash_offramper_id.inputs[i] <== reveal_payee_name_packed[i];
    }
    hash_offramper_id.inputs[5] <== reveal_payee_mobile_num_packed[0];
    signal output offramper_id <== hash_offramper_id.out;

    // Output hashed payment id nullifier = hash(payment_id_packed)
    assert(max_payment_id_packed_bytes == 4);
    component hash_payment_id = Poseidon(4);
    for (var i = 0; i < 4; i++) {
        hash_payment_id.inputs[i] <== reveal_payment_id_packed[i];
    }
    signal output payment_id_nullifier <== hash_payment_id.out;

    // The following signals do not take part in any computation, but tie the proof to a specific intent_hash & claim_id to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input intent_hash;
    signal intent_hash_squared;
    intent_hash_squared <== intent_hash * intent_hash;

    // TOTAL CONSTRAINTS: 4151467
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 2240 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ intent_hash ] } = PaylahSendEmail(1024, 2240, 121, 17, 7);
