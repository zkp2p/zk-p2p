pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/circuits/regexes/from_regex.circom";
include "./regexes/venmo_payee_id.circom";
include "./regexes/venmo_timestamp.circom";

template VenmoReceiveRegistrationEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(max_header_bytes % 64 == 0);
    assert(max_body_bytes % 64 == 0);
    assert(n * k > 1024); // constraints for 1024 bit RSA
    assert(n < (255 \ 2)); // we want a multiplication to fit into a circom signal

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

    // EmailVerifier(max_header_bytes, max_body_bytes, n, k, 0)(in_padded, modulus, signature, in_len_padded_bytes, body_hash_idx, precomputed_sha, in_body_padded, in_body_len_padded_bytes);

    // FROM HEADER REGEX: 736,553 constraints
    // TODO: we set max len to 30 for all public outputs below for ease of use in the verifier contract for now
    // This extracts the from email, and the precise regex format can be viewed in the README
    var max_email_from_len = 30;
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes]; // packed into 7-bytes

    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegex(max_header_bytes)(in_padded);
    from_regex_out === 1;
    reveal_email_from_packed <== ShiftAndPack(max_header_bytes, max_email_from_len, pack_size)(from_regex_reveal, email_from_idx);

    // VENMO RECEIVE PAYEE ID REGEX: [x]
    // We will optimize the size later on
    var max_venmo_receive_len = 30;
    var max_venmo_receive_packed_bytes = count_packed(max_venmo_receive_len, pack_size); // ceil(max_num_bytes / 7)
    
    signal input venmo_receive_id_idx;
    signal output reveal_venmo_receive_packed[max_venmo_receive_packed_bytes];

    signal (venmo_receive_regex_out, venmo_receive_regex_reveal[max_body_bytes]) <== VenmoPayeeId(max_body_bytes)(in_body_padded);

    for (var i = 0; i < max_body_bytes; i++) {
        if (venmo_receive_regex_reveal[i] != 0) {
            log(venmo_receive_regex_reveal[i]);
        }
    }
    signal is_found_venmo_receive <== IsZero()(venmo_receive_regex_out);
    is_found_venmo_receive === 0;

    // PACKING: 16,800 constraints (Total: [x])
    reveal_venmo_receive_packed <== ShiftAndPack(max_body_bytes, max_venmo_receive_len, pack_size)(venmo_receive_regex_reveal, venmo_receive_id_idx);

    // Hash onramper ID
    component hash = Poseidon(max_venmo_receive_packed_bytes);
    assert(max_venmo_receive_packed_bytes < 16);
    for (var i = 0; i < max_venmo_receive_packed_bytes; i++) {
        hash.inputs[i] <== reveal_venmo_receive_packed[i];
    }
    signal output packed_onramper_id_hashed <== hash.out;
}

// In circom, all output signals of the main component are public (and cannot be made private), the input signals of the main component are private if not stated otherwise using the keyword public as above. The rest of signals are all private and cannot be made public.
// This makes modulus, order_id and signature public. Signature being public means it allows the mailserver to trace who the offender is.

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 6400 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ modulus, signature ] } = VenmoReceiveRegistrationEmail(1024, 5952, 121, 17, 7);
