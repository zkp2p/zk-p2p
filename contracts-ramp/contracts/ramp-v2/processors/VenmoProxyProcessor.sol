// SPDX-License-Identifier: MIT

import { ClaimVerifier } from "../../lib/ClaimVerifier.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ProxyBaseProcessor } from "../../processors/base-processors/ProxyBaseProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { DateParsing } from "../../lib/DateParsing.sol";

import { IRampV2 } from "../interfaces/IRampV2.sol";
import { IProcessorV2 } from "../interfaces/IProcessorV2.sol";

pragma solidity ^0.8.18;


contract VenmoProxyProcessor is IProcessorV2, ProxyBaseProcessor {

    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint8 internal constant MAX_EXTRACT_VALUES = 5;
    uint256 internal constant PRECISE_UNIT = 1e18;

    /* ============ State Variables ============ */
    address public immutable ramp;
    
    uint256 public timestampBuffer;

    uint256 public maxOnRampAmount;                                 // Maximum amount of USDC that can be on-ramped in a single transaction
    uint256 public onRampCooldownPeriod;                            // Time period that must elapse between completing an on-ramp and signaling a new intent
    uint256 public intentExpirationPeriod;                          // Time period after which an intent can be pruned from the system
    

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _maxOnRampAmount,
        uint256 _onRampCooldownPeriod,
        uint256 _intentExpirationPeriod,
        string[] memory _providerHashes,
        uint256 _timestampBuffer
    )   
        ProxyBaseProcessor(_nullifierRegistry, _providerHashes)
    {
        ramp = _ramp;
        maxOnRampAmount = _maxOnRampAmount;
        onRampCooldownPeriod = _onRampCooldownPeriod;
        intentExpirationPeriod = _intentExpirationPeriod;
        timestampBuffer = _timestampBuffer;
    }

    /* ============ External Functions ============ */

    /**
     * @notice Extracts the intent hash from the proof.
     *
     * @param _proof The proof to extract the intent hash from.
     */
    function extractIntentHash(bytes calldata _proof) external pure returns (bytes32 intentHash) {
        Proof memory proof = abi.decode(_proof, (Proof));
        // return proof.claimInfo.intentHash;

        return bytes32(0);
    }

    /**
     * ONLY RAMP: Verifies proof. Extracts values.
     *
     * @param _proof        Proof to be verified
     */
    function verifyPayment(
        bytes calldata _proof,
        IRampV2.Intent calldata _intent,
        IRampV2.Deposit calldata _deposit
    )
        external 
        override
        returns (bool)
    {
        require(msg.sender == ramp, "Only ramp can call");

        // Decode the proof
        Proof memory proof = abi.decode(_proof, (Proof));

        verifyProofSignatures(proof);

        (
            string memory amountString,
            string memory dateString,
            string memory paymentId,
            string memory recipientVenmoId,
            string memory providerHash
        ) = _extractValues(proof);

        // Check provider hash
        require(_validateProviderHash(providerHash), "No valid providerHash");

        // Extract values from deposit and intent
        bytes32 offRamperId = _extractDepositValues(_deposit);

        // Format the values
        uint256 amount = amountString.stringToUint(6);  // Desired decimals is 6 for USDC
        uint256 paymentTimestamp = DateParsing._dateStringToTimestamp(dateString) + timestampBuffer;
        bytes32 offRamperIdHash = keccak256(abi.encodePacked(offRamperId));

        // Validate the payment requirements
        // Confirm payment was sent "to" offramper "at" the right time and "for" the right amount
        require(paymentTimestamp >= _intent.timestamp, "Payment timestamp is before intent timestamp");
        require(amount >= (_intent.amount * PRECISE_UNIT) / _deposit.conversionRate, "Payment amount is less than intent amount");
        require(offRamperIdHash == offRamperId, "Payment offramper does not match intent relayer");
        
        _validateAndAddNullifier(keccak256(abi.encodePacked(paymentId)));
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
     * Extracts the offramper id from the deposit data. This could also be used to extract 
     * other values from the deposit data if needed.
     *
     * @param _deposit The deposit to extract the offramper id from.
     */
    function _extractDepositValues(
        IRampV2.Deposit calldata _deposit
    ) internal returns (bytes32 offRamperId) {
        offRamperId = abi.decode(_deposit.data, (bytes32));
    }

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
            values[4]  // providerHash
        );
    }
}
