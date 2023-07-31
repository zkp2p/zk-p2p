pragma circom 2.1.5;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/helpers/sha.circom";
include "@zk-email/circuits/helpers/rsa.circom";
include "@zk-email/circuits/helpers/base64.circom";
include "@zk-email/circuits/helpers/extract.circom";
include "@zk-email/circuits/email-verifier.circom";

include "@zk-email/circuits/regexes/from_regex.circom";
include "@zk-email/circuits/regexes/tofrom_domain_regex.circom";
include "@zk-email/circuits/regexes/body_hash_regex.circom";
include "./regexes/venmo_receive_id.circom";
include "./regexes/venmo_timestamp.circom";

// Here, n and k are the biginteger parameters for RSA
// This is because the number is chunked into k pack_size of n bits each
// Max header bytes shouldn't need to be changed much per email,
// but the max mody bytes may need to be changed to be larger if the email has a lot of i.e. HTML formatting
// TODO: split into header and body
template VenmoReceiveEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(max_header_bytes % 64 == 0);
    assert(max_body_bytes % 64 == 0);
    assert(n * k > 1024); // constraints for 2048 bit RSA
    assert(n < (255 \ 2)); // we want a multiplication to fit into a circom signal

    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input modulus[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length


    // Base 64 body hash variables
    signal input body_hash_idx;

    // Precomputed sha vars for big body hashing
    // Next 3 signals are for decreasing SHA constraints for parsing out information from the in-body text
    // The precomputed_sha value is the Merkle-Damgard state of our SHA hash uptil our first regex match
    // This allows us to save a ton of SHA constraints by only hashing the relevant part of the body
    // It doesn't have an impact on security since a user must have known the pre-image of a signed message to be able to fake it
    // The lower two body signals describe the suffix of the body that we care about
    // The part before these signals, a significant prefix of the body, has been pre-hashed into precomputed_sha.
    signal input precomputed_sha[32];
    signal input in_body_padded[max_body_bytes];
    signal input in_body_len_padded_bytes;

    EmailVerifier(max_header_bytes, max_body_bytes, n, k, 0)(in_padded, modulus, signature, in_len_padded_bytes, body_hash_idx, precomputed_sha, in_body_padded, in_body_len_padded_bytes);


    //
    // CUSTOM REGEXES
    //

    // TIMESTAMP REGEX: [x]
    // TODO: we set max email amount len to 30 for all public outputs below for ease of use in the verifier contract for now
    // We will optimize the size later on
    var max_email_timestamp_len = 30;
    var max_email_timestamp_packed_bytes = count_packed(max_email_timestamp_len, pack_size);
    assert(max_email_timestamp_packed_bytes < max_header_bytes);

    signal input email_timestamp_idx;
    signal output reveal_email_timestamp_packed[max_email_timestamp_packed_bytes]; // packed into 7-bytes. TODO: make this rotate to take up even less space

    signal timestamp_regex_out, timestamp_regex_reveal[max_header_bytes];
    (timestamp_regex_out, timestamp_regex_reveal) <== VenmoTimestampRegex(max_header_bytes)(in_padded);
    timestamp_regex_out === 1;

    // PACKING: 16,800 constraints (Total: [x])
    reveal_email_timestamp_packed <== ShiftAndPack(max_header_bytes, max_email_timestamp_len, pack_size)(timestamp_regex_reveal, email_timestamp_idx);
    
    
    // VENMO RECEIVE ONRAMPER ID REGEX: [x]
    var max_venmo_receive_len = 30;
    var max_venmo_receive_packed_bytes = count_packed(max_venmo_receive_len, pack_size); // ceil(max_num_bytes / 7)
    
    signal input venmo_receive_id_idx;
    signal output reveal_venmo_receive_packed[max_venmo_receive_packed_bytes];

    signal (venmo_receive_regex_out, venmo_receive_regex_reveal[max_body_bytes]) <== VenmoReceiveId(max_body_bytes)(in_body_padded);
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
    // log("Hash of packed Venmo Onramper ID", packed_onramper_id_hashed);

    // The following signals do not take part in any computation, but tie the proof to a specific order_id to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input order_id;
    signal order_id_squared;
    order_id_squared <== order_id * order_id;
}

// In circom, all output signals of the main component are public (and cannot be made private), the input signals of the main component are private if not stated otherwise using the keyword public as above. The rest of signals are all private and cannot be made public.
// This makes modulus, order_id and signature public. Signature being public means it allows the mailserver to trace who the offender is.

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 6400 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 9 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ modulus, signature, order_id ] } = VenmoReceiveEmail(1024, 6400, 121, 17, 7);
