pragma circom 2.1.5;

include "../utils/ceil.circom";
include "../regexes/common/from_regex.circom";
include "../regexes/common/to_regex.circom";


template PaylahOnramperId(
    max_header_bytes, 
    max_body_bytes, 
    pack_size
) {
    var max_email_to_len = 49;  // RFC 2821: requires length to be 254, but 49 is safe max length of email to field (https://atdata.com/long-email-addresses/)
    var max_mobile_number_len = 4; // Example: 1234
    assert(pack_size == 7);

    // TO HEADER REGEX
    // NOTE: This does not work for hotmail users because hotmail (does not sign the to???)
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);
    assert(max_email_to_packed_bytes == 7);

    signal input in_padded[max_header_bytes];
    signal input email_to_idx;
    signal reveal_email_to_packed[max_email_to_packed_bytes]; // Not a public output
    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegex(max_header_bytes)(in_padded);
    to_regex_out === 1;
    reveal_email_to_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_to_len, pack_size)(to_regex_reveal, email_to_idx);

    // PAYER MOBILE NUMBER REGEX
    // NOTE: Protonmail encrypts the email body, so we can't regex this
    var max_mobile_num_packed_bytes = count_packed(max_mobile_number_len, pack_size);
    assert(max_mobile_num_packed_bytes < max_body_bytes);
    assert(max_mobile_num_packed_bytes == 1);

    signal input in_body_padded[max_body_bytes];
    signal input paylah_payer_mobile_num_idx;
    signal reveal_payer_mobile_num_packed[max_mobile_num_packed_bytes]; // Not a public output
    signal input payer_mobile_num_regex_reveal[max_body_bytes]; // Get this from calling circuit
    reveal_payer_mobile_num_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_mobile_number_len, pack_size)(payer_mobile_num_regex_reveal, paylah_payer_mobile_num_idx);

    // HASH "TO" EMAIL ID + PAYER mobile NUMBER
    var max_total_id_packed_bytes = max_email_to_packed_bytes + max_mobile_num_packed_bytes;
    assert(max_total_id_packed_bytes == 8);

    // Feed first 6 bytes into the first hash
    // Feed outupt of first hash + last 2 bytes into the second hash
    component hash1 = Poseidon(6);
    for (var i = 0; i < 6; i++) {
        hash1.inputs[i] <== reveal_email_to_packed[i];
    }
    component hash2 = Poseidon(3);
    hash2.inputs[0] <== hash1.out;
    hash2.inputs[1] <== reveal_email_to_packed[6];
    hash2.inputs[2] <== reveal_payer_mobile_num_packed[0];
    
    signal output packed_id_hashed <== hash2.out;
}