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
include "./regexes/to_regex.circom";
include "./regexes/hdfc/hdfc_accnum.circom";

template HdfcRegistrationEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 1024); // constraints for 1024 bit RSA

    // Rounded to the nearest multiple of pack_size for extra room in case of change of constants
    var max_email_from_len = ceil(21, pack_size); // RFC 2821: requires length to be 254, but we can limit to 21 (alerts@hdfcbank.net)
    var max_email_to_len = ceil(35, pack_size); // TODO: Change this.
    var max_account_number_len = ceil(7, pack_size);    // TODO: Change this. Max is only 4 digits but set to 7 for now.

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

    // TO HEADER REGEX
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);

    signal input email_to_idx;
    signal reveal_email_to_packed[max_email_to_packed_bytes]; // Not a public output

    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegex(max_header_bytes)(in_padded);
    to_regex_out === 1;
    reveal_email_to_packed <== ShiftAndPackMaskedStr(max_header_bytes, max_email_to_len, pack_size)(to_regex_reveal, email_to_idx);

    // HDFC ACCOUNT NUMBER REGEX
    var max_acc_num_packed_bytes = count_packed(max_account_number_len, pack_size); // ceil(max_num_bytes / 7)

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

    // TOTAL CONSTRAINTS: (WITH STUB): 780077
    // WITHOUT STUB: TODO
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 3200 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main = HdfcRegistrationEmail(1024, 3200, 121, 17, 7);