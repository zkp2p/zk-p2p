pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/circuits/helpers/extract.circom";

include "../utils/ceil.circom";
include "../common-v2/regexes/from_regex_v2.circom";
include "../common-v2/regexes/to_regex_v2.circom";

include "./regexes/mercado_subject.circom";

template MercadoRegistrationEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    //-------EMAIL VERIFICATION----------//

    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input modulus[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length

    signal output modulus_hash;

    // DKIM VERIFICATION
    var ignore_body_hash_check = 1; // Ignore body hash check; WARNING: Set it back to 1 if extracting anything from body
    component EV = EmailVerifier(max_header_bytes, max_body_bytes, n, k, ignore_body_hash_check);
    EV.in_padded <== in_padded;
    EV.pubkey <== modulus;
    EV.signature <== signature;
    EV.in_len_padded_bytes <== in_len_padded_bytes;
    
    modulus_hash <== EV.pubkey_hash;

    //-------CONSTANTS----------//

    var max_email_from_len = 20; // Length of info@mercadopago.com
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    var max_email_to_len = 49;  // RFC 2821: requires length to be 254, but 49 is safe max length of email to field (https://atdata.com/long-email-addresses/)
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);

    //-------REGEXES----------//

    // Mercado subject regex
    signal subject_regex_out <== MercadoSubjectRegex(max_header_bytes)(in_padded);
    subject_regex_out === 1;
    
    // TODO: SHOULD WE RESTRICT THE ENTITY AS WELL?

    // From regex V2
    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegexV2(max_header_bytes)(in_padded);
    from_regex_out === 1;
    
    // To regex V2
    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegexV2(max_header_bytes)(in_padded);
    to_regex_out === 1;


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
    
    //-------REGISTRATION ID----------//

    // TODO: INSERT SALT FOR PRIVACY OF REGISTRATION ID
    // Output hashed user id = hash(to_packed)
    var max_id_bytes = max_email_to_packed_bytes;
    assert(max_id_bytes < 16);
    component hash = Poseidon(max_id_bytes);
    for (var i = 0; i < max_email_to_packed_bytes; i++) {
        hash.inputs[i] <== reveal_email_to_packed[i];
    }
    signal output registration_id <== hash.out;

    // TODO: CAN HEADER BE REDUCED TO 512 OR SOME <1024 BYTES?
    // TOTAL CONSTRAINTS: 1334706
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 0 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main = MercadoRegistrationEmail(1024, 0, 121, 17, 7);


