// SPDX-License-Identifier: MIT

import { ClaimVerifier } from "../../lib/ClaimVerifier.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ProxyBaseProcessor } from "../../processors/ProxyBaseProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { DateParsing } from "../../lib/DateParsing.sol";

import { ISendProcessorV3 } from "./interfaces/ISendProcessorV3.sol";

pragma solidity ^0.8.18;


contract VenmoSendProcessorV3 is ISendProcessorV3, ProxyBaseProcessor {

    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint8 constant MAX_EXTRACT_VALUES = 5;

    /* ============ State Variables ============ */
    address public immutable ramp;
    
    uint256 public timestampBuffer;
    

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        string[] memory _providerHashes,
        uint256 _timestampBuffer
    )   
        ProxyBaseProcessor(_nullifierRegistry, _providerHashes)
    {
        ramp = _ramp;
        timestampBuffer = _timestampBuffer;
    }

    /* ============ External Functions ============ */

    /**
     * ONLY RAMP: Verifies proof. Extracts values.
     *
     * @param _proof        Proof to be verified
     */
    function processProof(
        Proof memory _proof
    ) 
        external 
        override
        returns (
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperIdHash,
            bytes32 onRamperIdHash,
            bytes32 intentHash
        )
    {
        require(msg.sender == ramp, "Only ramp can call");

        verifyProofSignatures(_proof);

        (
            string memory amountString,
            string memory dateString,
            string memory paymentId,
            string memory recipientVenmoId,
            string memory senderVenmoId,
            string memory providerHash
        ) = _extractValues(_proof);

        // Check provider hash
        require(_validateProviderHash(providerHash), "No valid providerHash");

        amount = amountString.stringToUint(6);  // Desired decimals is 6 for USDC

        // TODO: Confirm that the response always contains date in UTC.
        timestamp = DateParsing._dateStringToTimestamp(dateString) + timestampBuffer;

        offRamperIdHash = keccak256(abi.encodePacked(recipientVenmoId));
        
        // TODO: Hash this offchain to preserve privacy
        onRamperIdHash = keccak256(abi.encodePacked(senderVenmoId));

        _validateAndAddNullifier(keccak256(abi.encodePacked(paymentId)));

        // TODO: How to insert this to the claim?
        intentHash = bytes32(0);
    }

    /* ============ External Functions ============ */

    /**
     * @notice ONLY OWNER: Sets the timestamp buffer for payments. This is the amount of time in seconds
     * that the timestamp can be off by and still be considered valid. Necessary to build in flexibility 
     * with L2 timestamps.
     *
     * @param _timestampBuffer    The timestamp buffer for payments
     */
    function setTimestampBuffer(uint256 _timestampBuffer) external onlyOwner {
        timestampBuffer = _timestampBuffer;
    }

    /* ============ Internal Functions ============ */

    /**
     * Extracts all values from the proof context.
     *
     * @param _proof The proof containing the context to extract values from.
     */
    function _extractValues(Proof memory _proof) internal pure returns (
        string memory amountString,
        string memory dateString,
        string memory paymentId,
        string memory recipientVenmoId,
        string memory senderVenmoId,
        string memory providerHash
    ) {
        string[] memory values = ClaimVerifier.extractAllFromContext(
            _proof.claimInfo.context, 
            MAX_EXTRACT_VALUES, 
            true
        );

        return (
            values[0], // amountString
            values[1], // dateString
            values[2], // paymentId
            values[3], // recipientVenmoId
            values[4], // senderVenmoId
            values[5]  // providerHash
        );
    }
}
