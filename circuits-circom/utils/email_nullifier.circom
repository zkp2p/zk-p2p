pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0c98b59 (Update to use cm rand)
// Nullifies a email using the header hash and a commitment to a random value
// Adapted from email-wallet https://github.com/zkemail/email-wallet
template EmailNullifier() {
    signal input header_hash[256];
    signal input cm_rand;
<<<<<<< HEAD
=======
// Adapted from email-wallet https://github.com/zkemail/email-wallet
template EmailNullifier() {
    signal input header_hash[256];
>>>>>>> 8d7aa80 (Add nullifier and update tests to TS)
=======
>>>>>>> 0c98b59 (Update to use cm rand)

    signal output email_nullifier;

    var field_pack_bits = 248;

<<<<<<< HEAD
<<<<<<< HEAD
    // Pack header hash into 1 int of size 248 bits
=======
    // Pack header hash into 1 int of 248 bits
>>>>>>> 8d7aa80 (Add nullifier and update tests to TS)
=======
    // Pack header hash into 1 int of size 248 bits
>>>>>>> 0c98b59 (Update to use cm rand)
    signal header_hash_int[field_pack_bits+1];
    header_hash_int[0] <== 0;
    for(var i = 0; i < field_pack_bits; i++) {
        header_hash_int[i+1] <== 2 * header_hash_int[i] + header_hash[i];
    }
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0c98b59 (Update to use cm rand)
    signal email_nullifier_input[2];
    email_nullifier_input[0] <== cm_rand;
    email_nullifier_input[1] <== header_hash_int[field_pack_bits];
    email_nullifier <== Poseidon(2)(email_nullifier_input);
<<<<<<< HEAD
=======
    email_nullifier <== header_hash_int[field_pack_bits];
>>>>>>> 8d7aa80 (Add nullifier and update tests to TS)
=======
>>>>>>> 0c98b59 (Update to use cm rand)
}