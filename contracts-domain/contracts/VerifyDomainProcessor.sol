// SPDX-License-Identifier: MIT

import { ClaimVerifier } from "./external/ClaimVerifier.sol";
import { INullifierRegistry } from "./external/interfaces/INullifierRegistry.sol";
import { ProxyBaseProcessor } from "./external/processors/ProxyBaseProcessor.sol";
import { StringConversionUtils } from "./external/lib/StringConversionUtils.sol";
import { TicketmasterDataParsing } from "./external/TicketmasterDataParsing.sol";

import { IVerifyDomainProcessor } from "./interfaces/IVerifyDomainProcessor.sol";

pragma solidity ^0.8.18;


contract VerifyDomainProcessor is IVerifyDomainProcessor, ProxyBaseProcessor {

    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint8 constant MAX_EXTRACT_VALUES = 5;

    /* ============ State Variables ============ */
    address public immutable registry;

    /* ============ Constructor ============ */
    constructor(
        address _registry,
        INullifierRegistry _nullifierRegistry,
        string[] memory _providerHashes
    )   
        ProxyBaseProcessor(_nullifierRegistry, _providerHashes)
    {
        registry = _registry;
    }

    /* ============ External Functions ============ */

    /**
     * ONLY REGISTRY: Verifies proofs. Extracts values and formats them into Domain structs.
     *
     * @param _proofs        Proofs to be verified
     * @return domains       Array of Domain structs
     */
    function verifyProofs(
        Proof[] memory _proofs
    ) 
        external 
        override
        returns (DomainRaw[] memory domains)
    {
        require(msg.sender == registry, "Only registry can call");

        domains = new DomainRaw[](_proofs.length);

        for (uint256 i = 0; i < _proofs.length; i++) {
            Proof memory proof = _proofs[i];

            verifyProofSignatures(proof);

            (
                string memory domainName,
                string memory expiryTimeStr,
                string memory providerHash
            ) = _extractValues(proof);

            // Check provider hash
            require(_validateProviderHash(providerHash), "No valid providerHash");

            _validateAndAddNullifier(proof.signedClaim.signatures);

            domains[i] = DomainRaw({
                name: domainName,
                // The TicketmasterDataParsing library's date parsing logic is pretty generic, and works for domain 
                // expiry dates as well. Similar to Ticketmaster dates, the expiry time is of the format "YYYY-MM-DDTHH:MM:SS"
                // and returns UTC timestamps.
                expiryTime: TicketmasterDataParsing._dateStringToTimestamp(expiryTimeStr)
            });
        }
    }

    /* ============ Internal Functions ============ */

    /**
     * Extracts all values from the proof context.
     *
     * @param _proof The proof containing the context to extract values from.
     */
    function _extractValues(Proof memory _proof) internal pure returns (
        string memory domainName,
        string memory expiryTime,
        string memory providerHash
    ) {
        string[] memory values = ClaimVerifier.extractAllFromContext(
            _proof.claimInfo.context, 
            MAX_EXTRACT_VALUES, 
            true
        );

        return (
            values[0], // domainName
            values[1], // expiryTime
            values[2]  // providerHash
        );
    }
}
