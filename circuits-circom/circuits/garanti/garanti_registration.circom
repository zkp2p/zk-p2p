pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/helpers/extract.circom";

include "../utils/ceil.circom";
include "../common-v2/regexes/from_regex_v2.circom";
include "../common-v2/regexes/to_regex_v2.circom";
include "./helpers/email-verifier-header.circom"; // Use local email verifier
include "./regexes/garanti_subject.circom";
include "./regexes/garanti_payer_details.circom";

template GarantiRegistrationEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    //-------EMAIL VERIFICATION----------//

    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input modulus[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length

    signal input body_hash_idx;
    // The precomputed_sha value is the Merkle-Damgard state of our SHA hash uptil our first regex match which allows us to save SHA constraints by only hashing the relevant part of the body
    signal input precomputed_sha[32];
    // Suffix of the body after precomputed SHA
    signal input in_body_padded[max_body_bytes];
    // Length of the body after precomputed SHA
    signal input in_body_len_padded_bytes;

    signal output modulus_hash;
    
    // DKIM VERIFICATION
    component EV = EmailVerifierHeader(max_header_bytes, max_body_bytes, n, k);
    EV.in_padded <== in_padded;
    EV.pubkey <== modulus;
    EV.signature <== signature;
    EV.body_hash_idx <== body_hash_idx;
    EV.in_len_padded_bytes <== in_len_padded_bytes;

    modulus_hash <== EV.pubkey_hash;

    //-------HASH INTERMEDIATE----------//

    // This hashes the body after the precomputed SHA, and outputs the intermediate hash
    signal intermediate_hash_bits[256] <== Sha256BytesPartial(max_body_bytes)(in_body_padded, in_body_len_padded_bytes, precomputed_sha);
    signal intermediate_hash_bytes[32];
    component bits2Num[32];
    for (var i = 0; i < 32; i++) {
        bits2Num[i] = Bits2Num(8);
        for (var j = 0; j < 8; j++) {
            bits2Num[i].in[7 - j] <== intermediate_hash_bits[i * 8 + j];
        }
        intermediate_hash_bytes[i] <== bits2Num[i].out;
    }

    //-------PACKING HASHES FOR CALLDATA----------//

    signal output intermediate_hash_packed[2] <== PackBytes(32, 2, 16)(intermediate_hash_bytes);
    signal output body_hash_packed[2] <== PackBytes(32, 2, 16)(EV.sha_b64_out);

    //-------CONSTANTS----------//

    var max_email_from_len = 31; // Length of garanti@info.garantibbva.com.tr
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    var max_email_to_len = 49;  // RFC 2821: requires length to be 254, but 49 is safe max length of email to field (https://atdata.com/long-email-addresses/)
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);

    var max_payer_mobile_num_len = 7; // +90 5XX XXX XXXX, 90 is country code for Turkey, 5XX is mobile phone code, XXX XXXX is subscriber number in the email
    var max_payer_mobile_num_packed_bytes = count_packed(max_payer_mobile_num_len, pack_size);
    assert(max_payer_mobile_num_packed_bytes < max_body_bytes);

    //-------REGEXES----------//

    // Garanti subject regex
    signal subject_regex_out <== GarantiSubjectRegex(max_header_bytes)(in_padded);
    subject_regex_out === 1;

    // From header V3 regex
    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegexV2(max_header_bytes)(in_padded);
    from_regex_out === 1;

    // To V2 regex
    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegexV2(max_header_bytes)(in_padded);
    to_regex_out === 1;

    // Garanti payer details regex
    signal (
        garanti_payer_details_regex_out, 
        payer_mobile_num_regex_reveal[max_body_bytes]
    ) <== GarantiPayerDetailsRegex(max_body_bytes)(in_body_padded);
    garanti_payer_details_regex_out === 1;

    //-------BUSINESS LOGIC----------//

    // Output packed email from
    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_email_from_len, 
        pack_size
    )(from_regex_reveal, email_from_idx);

    // Packed to (Not an output. Used used to compute user id)
    signal input email_to_idx;
    signal reveal_email_to_packed[max_email_to_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_email_to_len, 
        pack_size
    )(to_regex_reveal, email_to_idx);

    // Packed payer mobile number (Not an output. Used used to compute user id)
    signal input garanti_payer_mobile_num_idx;
    signal reveal_payer_mobile_num_packed[max_payer_mobile_num_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payer_mobile_num_len, 
        pack_size
    )(payer_mobile_num_regex_reveal, garanti_payer_mobile_num_idx);

    //-------USER REGISTRATION ID----------//

    // Output hashed registration id = hash(to_packed + payer_mobile_num_packed)
    var max_id_bytes = max_email_to_packed_bytes + max_payer_mobile_num_packed_bytes;
    assert(max_id_bytes < 16);
    
    component hash = Poseidon(max_id_bytes);
    for (var i = 0; i < max_email_to_packed_bytes; i++) {
        hash.inputs[i] <== reveal_email_to_packed[i];
    }
    for (var i = 0; i < max_payer_mobile_num_packed_bytes; i++) {
        hash.inputs[max_email_to_packed_bytes + i] <== reveal_payer_mobile_num_packed[i];
    }
    signal output registration_id <== hash.out;

    // TOTAL CONSTRAINTS: 4736899
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 2496 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main = GarantiRegistrationEmail(1024, 2496, 121, 17, 7);