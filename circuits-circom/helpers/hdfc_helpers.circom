pragma circom 2.1.5;

include "../utils/ceil.circom";
include "../regexes/from_regex.circom";
include "../regexes/to_regex.circom";
include "../regexes/hdfc/hdfc_amount.circom";
include "../regexes/hdfc/hdfc_accnum.circom";
include "../regexes/hdfc/hdfc_date.circom";
include "../regexes/hdfc/hdfc_payee_id.circom";
include "../regexes/hdfc/hdfc_upi_subject.circom";


template HdfcOnramperId(
    max_email_to_len, 
    max_header_bytes, 
    max_account_number_len, 
    max_body_bytes, 
    pack_size
) {
    // TO HEADER REGEX
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);
    signal input in_padded[max_header_bytes];
    signal input email_to_idx;
    signal reveal_email_to_packed[max_email_to_packed_bytes]; // Not a public output
    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegex(max_header_bytes)(in_padded);
    to_regex_out === 1;
    reveal_email_to_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_to_len, pack_size)(to_regex_reveal, email_to_idx);

    // HDFC ACCOUNT NUMBER REGEX
    var max_acc_num_packed_bytes = count_packed(max_account_number_len, pack_size);
    signal input in_body_padded[max_body_bytes];
    signal input hdfc_acc_num_idx;
    signal reveal_acc_num_packed[max_acc_num_packed_bytes]; // Not a public output
    signal (acc_num_regex_out, acc_num_regex_reveal[max_body_bytes]) <== HdfcAccountNumberRegex(max_body_bytes)(in_body_padded);
    acc_num_regex_out === 1;
    reveal_acc_num_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_account_number_len, pack_size)(acc_num_regex_reveal, hdfc_acc_num_idx);

    // HASH "TO" EMAIL ID + BANK ACCOUNT NUMBER
    var max_total_id_packed_bytes = max_email_to_packed_bytes + max_acc_num_packed_bytes;
    component hash = Poseidon(max_total_id_packed_bytes);
    assert(max_total_id_packed_bytes < 16);
    for (var i = 0; i < max_email_to_packed_bytes; i++) {
        hash.inputs[i] <== reveal_email_to_packed[i];
    }
    for (var i = 0; i < max_acc_num_packed_bytes; i++) {
        hash.inputs[i + max_email_to_packed_bytes] <== reveal_acc_num_packed[i];
    }
    signal output packed_id_hashed <== hash.out;   
}

template HdfcOfframperId(max_payee_len, max_body_bytes, pack_size) {
    // HDFC SEND PAYEE ID REGEX
    var max_payee_packed_bytes = count_packed(max_payee_len, pack_size);

    signal input in_body_padded[max_body_bytes];
    signal input hdfc_payee_id_idx;
    signal reveal_payee_packed[max_payee_packed_bytes];

    signal (payee_regex_out, payee_regex_reveal[max_body_bytes]) <== HdfcPayeeIdRegex(max_body_bytes)(in_body_padded);
    signal is_found_payee <== IsZero()(payee_regex_out);
    is_found_payee === 0;
    reveal_payee_packed <== ShiftAndPackMaskedStr(max_body_bytes, max_payee_len, pack_size)(payee_regex_reveal, hdfc_payee_id_idx);

    // HASH PAYEE ID
    component hash = Poseidon(max_payee_packed_bytes);
    assert(max_payee_packed_bytes < 16);
    for (var i = 0; i < max_payee_packed_bytes; i++) {
        hash.inputs[i] <== reveal_payee_packed[i];
    }
    signal output packed_offramper_id_hashed <== hash.out;
}