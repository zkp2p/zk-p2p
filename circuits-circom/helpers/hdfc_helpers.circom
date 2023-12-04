pragma circom 2.1.5;

include "../utils/ceil.circom";
include "../regexes/common/from_regex.circom";
include "../regexes/common/to_regex.circom";
include "../regexes/hdfc/hdfc_accnum.circom";
include "../regexes/hdfc/hdfc_payee_id.circom";


template HdfcOnramperId(
    max_header_bytes, 
    max_body_bytes, 
    pack_size
) {
    var max_email_to_len = 49;  // RFC 2821: requires length to be 254, but 49 is safe max length of email to field (https://atdata.com/long-email-addresses/)
    var max_account_number_len = 4; // Example: **1234
    assert(pack_size == 7);

    // TO HEADER REGEX
    // NOTE: this does not work for hotmail users
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);
    assert(max_email_to_packed_bytes == 7);

    signal input in_padded[max_header_bytes];
    signal input email_to_idx;
    signal reveal_email_to_packed[max_email_to_packed_bytes]; // Not a public output
    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegex(max_header_bytes)(in_padded);
    to_regex_out === 1;
    reveal_email_to_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_to_len, pack_size)(to_regex_reveal, email_to_idx);

    // HDFC ACCOUNT NUMBER REGEX
    // NOTE: Protonmail encrypts the email body, so we can't regex this
    var max_acc_num_packed_bytes = count_packed(max_account_number_len, pack_size);
    assert(max_acc_num_packed_bytes < max_body_bytes);
    assert(max_acc_num_packed_bytes == 1);

    signal input in_body_padded[max_body_bytes];
    signal input hdfc_acc_num_idx;
    signal reveal_acc_num_packed[max_acc_num_packed_bytes]; // Not a public output
    signal (acc_num_regex_out, acc_num_regex_reveal[max_body_bytes]) <== HdfcAccountNumberRegex(max_body_bytes)(in_body_padded);
    acc_num_regex_out === 1;
    reveal_acc_num_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_account_number_len, pack_size)(acc_num_regex_reveal, hdfc_acc_num_idx);

    // HASH "TO" EMAIL ID + BANK ACCOUNT NUMBER
    var max_total_id_packed_bytes = max_email_to_packed_bytes + max_acc_num_packed_bytes;
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
    hash2.inputs[2] <== reveal_acc_num_packed[0];
    
    signal output packed_id_hashed <== hash2.out;
}

template HdfcOfframperId(max_body_bytes, pack_size) {
    var max_payee_len = 50;    // Max 50 characters in UPI ID (https://www.deutschebank.co.in/en/connect-with-us/upi.html)

    // HDFC SEND PAYEE ID REGEX
    var max_payee_packed_bytes = count_packed(max_payee_len, pack_size);
    assert(max_payee_packed_bytes < max_body_bytes);
    assert(max_payee_packed_bytes == 8);

    signal input in_body_padded[max_body_bytes];
    signal input hdfc_payee_id_idx;
    signal reveal_payee_packed[max_payee_packed_bytes];

    signal (payee_regex_out, payee_regex_reveal[max_body_bytes]) <== HdfcPayeeIdRegex(max_body_bytes)(in_body_padded);
    signal is_found_payee <== IsZero()(payee_regex_out);
    is_found_payee === 0;
    reveal_payee_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_payee_len, pack_size)(payee_regex_reveal, hdfc_payee_id_idx);

    // HASH PAYEE ID
    // Feed first 6 bytes into the first hash
    // Feed outupt of first hash + last 2 bytes into the second hash
    component hash1 = Poseidon(6);
    for (var i = 0; i < 6; i++) {
        hash1.inputs[i] <== reveal_payee_packed[i];
    }
    component hash2 = Poseidon(3);
    hash2.inputs[0] <== hash1.out;
    hash2.inputs[1] <== reveal_payee_packed[6];
    hash2.inputs[2] <== reveal_payee_packed[7];

    signal output packed_offramper_id_hashed <== hash2.out;
}