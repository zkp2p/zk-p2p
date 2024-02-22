pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/circuits/helpers/extract.circom";

include "../utils/ceil.circom";
include "../utils/email_nullifier.circom";
include "../utils/hash_sign_gen_rand.circom";
include "../common-v2/regexes/from_regex_v2.circom";
include "../common-v2/regexes/to_regex_v2.circom";
include "../common-v2/regexes/body_hash_regex_v2.circom";
include "./regexes/garanti_subject.circom";
include "./regexes/garanti_payer_details.circom";
include "./regexes/garanti_payment_details.circom";
include "./regexes/garanti_timestamp.circom";


template GarantiSendEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
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
    var ignore_body_hash_check = 1; // Ignore body hash check
    component EV = EmailVerifier(max_header_bytes, max_body_bytes, n, k, ignore_body_hash_check);
    EV.in_padded <== in_padded;
    EV.pubkey <== modulus;
    EV.signature <== signature;
    EV.in_len_padded_bytes <== in_len_padded_bytes;

    modulus_hash <== EV.pubkey_hash;
    signal header_hash[256] <== EV.sha;

    //-------HASH INTERMEDIATE----------//

    // Assert padding is all zeroes
    AssertZeroes(max_body_bytes)(in_body_padded, in_body_len_padded_bytes + 1);

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
    // Pack intermediate hash for calldata
    signal output intermediate_hash_packed[2] <== PackBytes(32, 2, 16)(intermediate_hash_bytes);

    //-------BODY HASH V2 REGEX----------//

    var LEN_SHA_B64 = 44;     // ceil(32 / 3) * 4, due to base64 encoding.
    signal (bh_regex_out, bh_reveal[max_header_bytes]) <== BodyHashRegexV2(max_header_bytes)(in_padded);
    bh_regex_out === 1;
    signal shifted_bh_out[LEN_SHA_B64] <== VarShiftMaskedStr(max_header_bytes, LEN_SHA_B64)(bh_reveal, body_hash_idx);
    
    signal sha_b64_out[32] <== Base64Decode(32)(shifted_bh_out);    
    signal output body_hash_packed[2] <== PackBytes(32, 2, 16)(sha_b64_out);

    //-------CONSTANTS----------//

    var max_email_from_len = 31; // Length of garanti@info.garantibbva.com.tr
    var max_email_from_packed_bytes = count_packed(max_email_from_len, pack_size);
    assert(max_email_from_packed_bytes < max_header_bytes);

    var max_email_to_len = 49;  // RFC 2821: requires length to be 254, but 49 is safe max length of email to field (https://atdata.com/long-email-addresses/)
    var max_email_to_packed_bytes = count_packed(max_email_to_len, pack_size);
    assert(max_email_to_packed_bytes < max_header_bytes);

    var max_timestamp_len = 10; // 10 digits till year 2286
    var max_timestamp_packed_bytes = count_packed(max_timestamp_len, pack_size);
    assert(max_timestamp_packed_bytes < max_header_bytes);

    var max_payer_mobile_num_len = 7; // +90 5XX XXX XXXX, 90 is country code for Turkey, 5XX is mobile phone code, XXX XXXX is subscriber number in the email
    var max_payer_mobile_num_packed_bytes = count_packed(max_payer_mobile_num_len, pack_size);
    assert(max_payer_mobile_num_packed_bytes < max_body_bytes);

    var max_payee_name_len = 42; // International SWIFT standard for beneficiary name is 35 characters. We add some padding for special chars.
    var max_payee_name_packed_bytes = count_packed(max_payee_name_len, pack_size);
    assert(max_payee_name_packed_bytes < max_body_bytes);

    var max_payee_acc_num_len = 32; // Length of "TRXX XXXX XXXX XXXX XXXX XXXX XX"
    var max_payee_acc_num_packed_bytes = count_packed(max_payee_acc_num_len, pack_size);
    assert(max_payee_acc_num_packed_bytes < max_body_bytes);

    var max_amount_len = 8; // Length of "2.000,00"; // TODO: What is the MAX amount?
    var max_amount_packed_bytes = count_packed(max_amount_len, pack_size);
    assert(max_amount_packed_bytes < max_body_bytes);

    //-------REGEXES----------//

    // Garanti subject regex
    signal subject_regex_out <== GarantiSubjectRegex(max_header_bytes)(in_padded);
    subject_regex_out === 1;

    // From header V2 regex
    signal (from_regex_out, from_regex_reveal[max_header_bytes]) <== FromRegexV2(max_header_bytes)(in_padded);
    from_regex_out === 1;

    // To V2 regex
    signal (to_regex_out, to_regex_reveal[max_header_bytes]) <== ToRegexV2(max_header_bytes)(in_padded);
    to_regex_out === 1;

    // Garanti timestamp regex
    signal (timestamp_regex_out, timestamp_regex_reveal[max_header_bytes]) <== GarantiTimestampRegex(max_header_bytes)(in_padded);
    timestamp_regex_out === 1;

    // Garanti payer details regex
    signal (
        garanti_payer_details_regex_out, 
        payer_mobile_num_regex_reveal[max_body_bytes]
    ) <== GarantiPayerDetailsRegex(max_body_bytes)(in_body_padded);
    garanti_payer_details_regex_out === 1;

    // Garanti payment details regex
    signal (
        garanti_payment_details_regex_out,
        payee_name_regex_reveal[max_body_bytes],
        payee_acc_num_regex_reveal[max_body_bytes],
        amount_regex_reveal[max_body_bytes]
    ) <== GarantiPaymentDetailsRegex(max_body_bytes)(in_body_padded);
    garanti_payment_details_regex_out === 1;

    //-------BUSINESS LOGIC----------//

    // Output packed email from
    signal input email_from_idx;
    signal output reveal_email_from_packed[max_email_from_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_email_from_len, 
        pack_size
    )(from_regex_reveal, email_from_idx);

    // Output packed timestamp
    signal input email_timestamp_idx;
    signal output reveal_timestamp_packed[max_timestamp_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_timestamp_len, 
        pack_size
    )(timestamp_regex_reveal, email_timestamp_idx);

    // Packed to (Not an output. Used to compute onramper id)
    signal input email_to_idx;
    signal reveal_email_to_packed[max_email_to_packed_bytes] <== ShiftAndPackMaskedStr(
        max_header_bytes, 
        max_email_to_len, 
        pack_size
    )(to_regex_reveal, email_to_idx);

    // Packed payer mobile number (Not an output. Used to compute onramper id)
    signal input garanti_payer_mobile_num_idx;
    signal reveal_payer_mobile_num_packed[max_payer_mobile_num_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payer_mobile_num_len, 
        pack_size
    )(payer_mobile_num_regex_reveal, garanti_payer_mobile_num_idx);

    // Output packed payee name
    signal input garanti_payee_name_idx;
    signal output reveal_payee_name_packed[max_payee_name_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payee_name_len, 
        pack_size
    )(payee_name_regex_reveal, garanti_payee_name_idx);
    // Output packed payment account number
    signal input garanti_payee_acc_num_idx;
    signal output reveal_payee_acc_num_packed[max_payee_acc_num_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_payee_acc_num_len, 
        pack_size
    )(payee_acc_num_regex_reveal, garanti_payee_acc_num_idx);

    // Output packed payment amount
    signal input garanti_amount_idx;
    signal output reveal_amount_packed[max_amount_packed_bytes] <== ShiftAndPackMaskedStr(
        max_body_bytes, 
        max_amount_len, 
        pack_size
    )(amount_regex_reveal, garanti_amount_idx);


    //-------POSEIDON HASHING----------//

    // Output hashed onramper id = hash(to_packed + payer_mobile_num_packed)
    var max_id_bytes = max_email_to_packed_bytes + max_payer_mobile_num_packed_bytes;
    assert(max_id_bytes < 16);
    
    component onramper_hash = Poseidon(max_id_bytes);
    for (var i = 0; i < max_email_to_packed_bytes; i++) {
        onramper_hash.inputs[i] <== reveal_email_to_packed[i];
    }
    for (var i = 0; i < max_payer_mobile_num_packed_bytes; i++) {
        onramper_hash.inputs[max_email_to_packed_bytes + i] <== reveal_payer_mobile_num_packed[i];
    }
    signal output onramper_id <== onramper_hash.out;

    // NULLIFIER
    signal output email_nullifier;
    signal cm_rand <== HashSignGenRand(n, k)(signature);
    email_nullifier <== EmailNullifier()(header_hash, cm_rand);

    // The following signals do not take part in any computation, but tie the proof to a specific intent_hash & claim_id to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input intent_hash;
    signal intent_hash_squared;
    intent_hash_squared <== intent_hash * intent_hash;

    // TOTAL CONSTRAINTS: 5048064
}


// Args:
// * max_header_bytes = 512 is the max number of bytes in the header
// * max_body_bytes = 2688 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main { public [ intent_hash ] } = GarantiSendEmail(512, 2688, 121, 17, 7);