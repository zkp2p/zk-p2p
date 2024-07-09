pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/utils/regex.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";

include "../utils/ceil.circom";
include "../utils/email_nullifier.circom";
include "../utils/hash_sign_gen_rand.circom";

include "./regexes/namecheap_subject.circom";
include "./regexes/namecheap_date.circom";
include "./regexes/namecheap_transfer_details.circom";

include "../common-v2/regexes/to_regex_v2.circom";      // todo: should we write a new one?


/// @title NamecheapPushDomainVerifier
/// @notice Circuit to verify input email matches Namecheap push domain email, and extract the new domain registrant and domain name

/// @param maxHeadersLength Maximum length for the email header.
/// @param maxBodyLength Maximum length for the email body.
/// @param n Number of bits per chunk the RSA key is split into. Recommended to be 121.
/// @param k Number of chunks the RSA key is split into. Recommended to be 17.
/// @input emailHeader Email headers that are signed (ones in `DKIM-Signature` header) as ASCII int[], padded as per SHA-256 block size.
/// @input emailHeaderLength Length of the email header including the SHA-256 padding.
/// @input pubkey RSA public key split into k chunks of n bits each.
/// @input signature RSA signature split into k chunks of n bits each.
/// @input emailBody Email body after the precomputed SHA as ASCII int[], padded as per SHA-256 block size.
/// @input emailBodyLength Length of the email body including the SHA-256 padding.
/// @input bodyHashIndex Index of the body hash `bh` in the emailHeader.
/// @input precomputedSHA Precomputed SHA-256 hash of the email body till the bodyHashIndex.

/// @input fromEmailIndex
/// @input toEmailIndex
/// @input namecheapBuyerIdIndex
/// @input namecheapDomainNameIndex
/// @input intentHash or address ETH address as identity commitment (to make it as part of the proof).

/// @output fromEmailAddPacked
/// @output pubkeyHash Poseidon hash of the pubkey - Poseidon(n/2)(n/2 chunks of pubkey with k*2 bits per chunk).
/// @output buyerIdPacked
/// @output domainNamePacked
template NamecheapPushDomainVerifier(maxHeadersLength, maxBodyLength, n, k) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    //-------EMAIL VERIFICATION----------//

    signal input emailHeader[maxHeadersLength];
    signal input emailHeaderLength;
    signal input pubkey[k];
    signal input signature[k];
    signal input emailBody[maxBodyLength];
    signal input emailBodyLength;
    signal input bodyHashIndex;
    signal input precomputedSHA[32];

    signal output pubkeyHash;

    // DKIM VERIFICATION
    component EV = EmailVerifier(maxHeadersLength, maxBodyLength, n, k, 0);
    EV.emailHeader <== emailHeader;
    EV.pubkey <== pubkey;
    EV.signature <== signature;
    EV.emailHeaderLength <== emailHeaderLength;
    EV.bodyHashIndex <== bodyHashIndex;
    EV.precomputedSHA <== precomputedSHA;
    EV.emailBody <== emailBody;
    EV.emailBodyLength <== emailBodyLength;

    pubkeyHash <== EV.pubkeyHash;
    signal headerHash[256] <== EV.sha;

    //-------CONSTANTS----------//

    var maxEmailFromLen = 21; // Length of support@namecheap.com
    var maxEmailToLen = 49;  // RFC 2821: requires length to be 254, but 49 is safe max length of email to field (https://atdata.com/long-email-addresses/)
    var maxDateLen = 10;
    var maxBuyerIdLen = 30;      // todo
    var maxDomainNameLen = 42;  // todo
    
    //-------REGEXES----------//

    // Namecheap subject regex
    signal subjectFound <== NamecheapSubjectRegex(maxHeadersLength)(emailHeader);
    subjectFound === 1;

    // From header regex
    signal (fromEmailFound, fromEmailReveal[maxHeadersLength]) <== FromAddrRegex(maxHeadersLength)(emailHeader);
    fromEmailFound === 1;

    // TODO: Write To V3 Regex.
    // To V2 regex. 
    // signal (toEmailFound, toEmailReveal[maxHeadersLength]) <== ToRegexV2(maxHeadersLength)(emailHeader);
    // toEmailFound === 1;

    // Namecheap date regex
    signal (dateRegexFound, dateReveal[maxBodyLength]) <== NamecheapDateRegex(maxBodyLength)(emailBody);
    dateRegexFound === 1;

    // Namecheap transfer details regex
    signal (
        transferDetailsFound, 
        buyerIdReveal[maxBodyLength],
        domainNameReveal[maxBodyLength]
    ) <== NamecheapTransferDetailsRegex(maxBodyLength)(emailBody);
    transferDetailsFound === 1;

    
    //-------BUSINESS LOGIC----------//

    // Output packed email from
    signal input fromEmailIndex;
    signal output fromEmailAddrPacks[1] <== PackRegexReveal(maxHeadersLength, maxEmailFromLen)(fromEmailReveal, fromEmailIndex);

    // Packed to (Not an output. Used to compute seller id)
    signal input toEmailIndex;
    // signal toEmailAddrPacked[2] <== PackRegexReveal(maxHeadersLength, maxEmailToLen)(toEmailReveal, toEmailIndex);

    // Output packed date
    signal input namecheapDateIndex;
    signal output datePacked[1] <== PackRegexReveal(maxBodyLength, maxDateLen)(dateReveal, namecheapDateIndex);
    
    // Output packed buyer id
    signal input namecheapBuyerIdIndex;
    signal output buyerIdPacked[1] <== PackRegexReveal(maxBodyLength, maxBuyerIdLen)(buyerIdReveal, namecheapBuyerIdIndex);

    // Output packed domain name
    signal input namecheapDomainNameIndex;
    signal output domainNamePacked[2] <== PackRegexReveal(maxBodyLength, maxDomainNameLen)(domainNameReveal, namecheapDomainNameIndex);
    
    //-------POSEIDON HASHING----------//

    // component sellerIdHasher = Poseidon(2);
    // for (var i = 0; i < 2; i++) {
    //     sellerIdHasher.inputs[i] <== toEmailAddrPacked[i];
    // }
    // signal output sellerIdHash <== sellerIdHasher.out;

    // NULLIFIER
    signal output emailNullifier;
    signal cmRand <== HashSignGenRand(n, k)(signature);
    emailNullifier <== EmailNullifier()(headerHash, cmRand);

    // The following signals do not take part in any computation, but tie the proof to a specific intentHash to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input intentHash;
    signal intentHashSquared;
    intentHashSquared <== intentHash * intentHash;

    // TOTAL CONSTRAINTS: 3444937
}


// Args:
// * maxHeadersLength = 768 is the max number of bytes in the header
// * maxBodyLength = 768 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
component main { public [ intentHash ] } = NamecheapPushDomainVerifier(768, 768, 121, 17);