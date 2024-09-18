pragma circom 2.1.9;

include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/utils/regex.circom";
include "@zk-email/circuits/helpers/email-nullifier.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";

include "./regexes/namecheap_subject.circom";
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
/// @input namecheapBuyerIdIndex Index of buyer id in the namecheap email body
/// @input namecheapDomainNameIndex Index of domain name in the namecheap email body
/// @input bidId On-chain bid id as identity commitment (to make it as part of the proof).
/// @output pubkeyHash Poseidon hash of the pubkey - Poseidon(n/2)(n/2 chunks of pubkey with k*2 bits per chunk).
/// @output fromEmailAddrPacked Packed from email address extracted from the email header (Default packing size is 31)
/// @output domainNamePacked Packed domain name extracted from the email body (array of length 5)
/// @output buyerIdHash Hash of packed buyer Id (new domain registrant) extracted from the email body
/// @output emailNullifier Nullifier generated from email by hashing the header and randomness generated from signature
/// @output bidId On-chain bid id input during proof gen and is tied to this proof
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
    var maxBuyerIdLen = 31;             // same as pack size; should be good enough
    var maxDomainNameLen = 127;         // Second-Level Domain (63) + "." (1) + Top-Level Domain (63)
    var maxEmailPackedChunks = 1;       // Max number of chunks for email address
    var maxBuyerIdPackedChunks = 1;     // Max number of chunks for buyer id
    var maxDomainNamePackedChunks = 5;  // Max number of chunks for domain name
    
    //---------------REGEXES------------------//

    // Namecheap subject regex
    signal subjectFound <== NamecheapSubjectRegex(maxHeadersLength)(emailHeader);
    subjectFound === 1;

    // From header regex
    signal (fromEmailFound, fromEmailReveal[maxHeadersLength]) <== FromAddrRegex(maxHeadersLength)(emailHeader);
    fromEmailFound === 1;

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
    
    // Assert fromEmailIndex < emailHeaderLength
    signal isFromIndexValid <== LessThan(log2Ceil(maxHeadersLength))([fromEmailIndex, emailHeaderLength]);
    isFromIndexValid === 1;

    signal output fromEmailAddrPacked[maxEmailPackedChunks] <== PackRegexReveal(maxHeadersLength, maxEmailFromLen)(fromEmailReveal, fromEmailIndex);

    // Packed buyer id (Hashed before making public output)
    signal input namecheapBuyerIdIndex;
    
    // Assert namecheapBuyerIdIndex < emailBodyLength
    signal namecheapBuyerIdIndexValid <== LessThan(log2Ceil(maxBodyLength))([namecheapBuyerIdIndex, emailBodyLength]);
    namecheapBuyerIdIndexValid === 1;

    signal buyerIdPacked[maxBuyerIdPackedChunks] <== PackRegexReveal(maxBodyLength, maxBuyerIdLen)(buyerIdReveal, namecheapBuyerIdIndex);

    // Output packed domain name
    signal input namecheapDomainNameIndex;
    
    // Assert namecheapDomainNameIndex < emailBodyLength
    signal namecheapDomainNameIndexValid <== LessThan(log2Ceil(maxBodyLength))([namecheapDomainNameIndex, emailBodyLength]);
    namecheapDomainNameIndexValid === 1;

    signal output domainNamePacked[maxDomainNamePackedChunks] <== PackRegexReveal(maxBodyLength, maxDomainNameLen)(domainNameReveal, namecheapDomainNameIndex);
    
    //---------------POSEIDON HASHING------------------//

    // Hash(buyerIdPacked)
    signal output buyerIdHash <== Poseidon(maxBuyerIdPackedChunks)(buyerIdPacked);

    // NULLIFIER
    signal output emailNullifier;
    emailNullifier <== EmailNullifier(n, k)(signature);

    // The following signals do not take part in any computation, but tie the proof to a specific intentHash to prevent replay attacks and frontrunning.
    // https://geometry.xyz/notebook/groth16-malleability
    signal input bidId;
    signal bidIdSquared;
    bidIdSquared <== bidId * bidId;

    // TOTAL CONSTRAINTS: 2980076
}


// Args:
// * maxHeadersLength = 768 is the max number of bytes in the header
// * maxBodyLength = 768 is the max number of bytes in the body after precomputed slice
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
component main { public [ bidId ] } = NamecheapPushDomainVerifier(768, 768, 121, 17);