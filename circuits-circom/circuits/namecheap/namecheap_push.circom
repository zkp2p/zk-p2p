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
/// @input fromEmailIndex Index of from email address in the email header
/// @input namecheapDateIndex Index of date in the namecheap email body
/// @input namecheapBuyerIdIndex Index of buyer id in the namecheap email body
/// @input namecheapDomainNameIndex Index of domain name in the namecheap email body
/// @input orderId On-chain order id as identity commitment (to make it as part of the proof).
/// @output pubkeyHash Poseidon hash of the pubkey - Poseidon(n/2)(n/2 chunks of pubkey with k*2 bits per chunk).
/// @output fromEmailAddrPacked Packed from email address extracted from the email header (Default packing size is 31)
/// @output datePacked Packed date extracted from the email body (Default packing size is 10)
/// @output domainNamePacked Packed domain name extracted from the email body (array of length 5)
/// @output buyerIdHash Hash of packed buyer Id (new domain registrant) extracted from the email body
/// @output emailNullifier Nullifier generated from email by hashing the header and randomness generated from signature
/// @output orderId On-chain order id input during proof gen and is tied to this proof
template NamecheapPushDomainVerifier(maxHeadersLength, maxBodyLength, n, k) {
    assert(n * k > 2048); // constraints for 2048 bit RSA

    //---------------EMAIL VERIFICATION------------------//

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

    //---------------CONSTANTS------------------//

    var maxEmailFromLen = 21;           // Length of support@namecheap.com
    var maxDateLen = 10;                // dd/mm/yyyy format
    var maxBuyerIdLen = 31;             // same as pack size; should be good enough
    var maxDomainNameLen = 127;         // Second-Level Domain (63) + "." (1) + Top-Level Domain (63)
    var maxEmailPackedChunks = 1;       // Max number of chunks for email address
    var maxBuyerIdPackedChunks = 1;     // Max number of chunks for buyer id
    var maxDatePackedChunks = 1;        // Max number of chunks for date
    var maxDomainNamePackedChunks = 5;  // Max number of chunks for domain name
    
    //---------------REGEXES------------------//

    // Namecheap subject regex
    signal subjectFound <== NamecheapSubjectRegex(maxHeadersLength)(emailHeader);
    subjectFound === 1;

    // From header regex
    signal (fromEmailFound, fromEmailReveal[maxHeadersLength]) <== FromAddrRegex(maxHeadersLength)(emailHeader);
    fromEmailFound === 1;

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

    
    //---------------BUSINESS LOGIC------------------//

    // Output packed email from
    signal input fromEmailIndex;
    signal output fromEmailAddrPacked[maxEmailPackedChunks] <== PackRegexReveal(maxHeadersLength, maxEmailFromLen)(fromEmailReveal, fromEmailIndex);

    // Output packed date
    signal input namecheapDateIndex;
    signal output datePacked[maxDatePackedChunks] <== PackRegexReveal(maxBodyLength, maxDateLen)(dateReveal, namecheapDateIndex);
    
    // Packed buyer id (Hashed before making public output)
    signal input namecheapBuyerIdIndex;
    signal buyerIdPacked[maxBuyerIdPackedChunks] <== PackRegexReveal(maxBodyLength, maxBuyerIdLen)(buyerIdReveal, namecheapBuyerIdIndex);

    // Output packed domain name
    signal input namecheapDomainNameIndex;
    signal output domainNamePacked[maxDomainNamePackedChunks] <== PackRegexReveal(maxBodyLength, maxDomainNameLen)(domainNameReveal, namecheapDomainNameIndex);
    
    //---------------POSEIDON HASHING------------------//

    // Hash(buyerIdPacked)
    signal output buyerIdHash <== Poseidon(maxBuyerIdPackedChunks)(buyerIdPacked);

    // NULLIFIER
    signal output emailNullifier;
    signal cmRand <== HashSignGenRand(n, k)(signature);
    emailNullifier <== EmailNullifier()(headerHash, cmRand);

    // The following signals do not take part in any computation, but tie the proof to a specific intentHash to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input orderId;
    signal orderIdSquared;
    orderIdSquared <== orderId * orderId;

    // TOTAL CONSTRAINTS: 3296837
}


// Args:
// * maxHeadersLength = 768 is the max number of bytes in the header
// * maxBodyLength = 768 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
component main { public [ orderId ] } = NamecheapPushDomainVerifier(768, 768, 121, 17);