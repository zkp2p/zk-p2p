pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/circuits/regexes/from_regex.circom";
include "./regexes/venmo_payee_id.circom";
include "./regexes/venmo_amount.circom";

template VenmoSendEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 1024); // constraints for 1024 bit RSA

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

    // VENMO SEND AMOUNT REGEX: [x]
    // TODO We will optimize the size later on
    var max_email_amount_len = 30;
    var max_email_amount_packed_bytes = count_packed(max_email_amount_len, pack_size);
    assert(max_email_amount_packed_bytes < max_header_bytes);

    signal input venmo_amount_idx;
    signal output reveal_email_amount_packed[max_email_amount_packed_bytes]; // packed into 7-bytes. TODO: make this rotate to take up even less space

    signal amount_regex_out, amount_regex_reveal[max_header_bytes];
    (amount_regex_out, amount_regex_reveal) <== VenmoAmountRegex(max_header_bytes)(in_padded);
    amount_regex_out === 1;

    reveal_email_amount_packed <== ShiftAndPack(max_header_bytes, max_email_amount_len, pack_size)(amount_regex_reveal, venmo_amount_idx);

    // VENMO SEND PAYEE ID REGEX: [x]
    // TODO We will optimize the size later on
    var max_payee_len = 30;
    var max_payee_packed_bytes = count_packed(max_payee_len, pack_size); // ceil(max_num_bytes / 7)
    
    signal input venmo_payee_id_idx;
    signal output reveal_payee_packed[max_payee_packed_bytes];

    signal (payee_regex_out, payee_regex_reveal[max_body_bytes]) <== VenmoPayeeId(max_body_bytes)(in_body_padded);
    signal is_found_payee <== IsZero()(payee_regex_out);
    is_found_payee === 0;

    // PACKING: 16,800 constraints (Total: [x])
    reveal_payee_packed <== ShiftAndPack(max_body_bytes, max_payee_len, pack_size)(payee_regex_reveal, venmo_payee_id_idx);

    // Hash offramper ID
    component hash = Poseidon(max_payee_packed_bytes);
    assert(max_payee_packed_bytes < 16);
    for (var i = 0; i < max_payee_packed_bytes; i++) {
        hash.inputs[i] <== reveal_payee_packed[i];
    }
    signal output packed_offramper_id_hashed <== hash.out;

    // The following signals do not take part in any computation, but tie the proof to a specific order_id & claim_id to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input order_id;
    signal order_id_squared;
    order_id_squared <== order_id * order_id;
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 5952 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ order_id ] } = VenmoSendEmail(1024, 5952, 121, 17, 7);