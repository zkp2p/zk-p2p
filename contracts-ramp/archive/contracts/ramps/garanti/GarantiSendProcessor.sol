//SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { BaseProcessorV2 } from "../../processors/BaseProcessorV2.sol";
import { Groth16Verifier } from "../../verifiers/garanti_send_verifier.sol";
import { IGarantiBodySuffixHashVerifier } from "./interfaces/IGarantiBodySuffixHashVerifier.sol";
import { IGarantiSendProcessor } from "./interfaces/IGarantiSendProcessor.sol";
import { IKeyHashAdapterV2 } from "../../processors/keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract GarantiSendProcessor is Groth16Verifier, IGarantiSendProcessor, BaseProcessorV2 {
    
    using StringUtils for uint256[];
    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint256 constant PACK_SIZE = 7;

    /* ============ Public Variables ============ */
    IGarantiBodySuffixHashVerifier public bodyHashVerifier;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapterV2 _garantiMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        IGarantiBodySuffixHashVerifier _bodyHashVerifier,
        string memory _emailFromAddress,
        uint256 _timestampBuffer
    )
        Groth16Verifier()
        BaseProcessorV2(
            _ramp,
            _garantiMailserverKeyHashAdapter,
            _nullifierRegistry,
            _emailFromAddress,
            _timestampBuffer
        )
    {
        bodyHashVerifier = _bodyHashVerifier;
    }
    
    /* ============ External Functions ============ */
    function processProof(
        IGarantiSendProcessor.SendProof calldata _proof,
        IGarantiBodySuffixHashVerifier.BodySuffixHashProof calldata _bodyHashProof
    )
        public
        override
        onlyRamp
        returns(
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperNameHash,
            bytes32 offRamperIdHash,
            bytes32 onRamperIdHash,
            bytes32 intentHash
        )
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first
        require(
            bodyHashVerifier.verifyProof(_bodyHashProof.a, _bodyHashProof.b, _bodyHashProof.c, _bodyHashProof.signals),
            "Invalid body hash proof"
        );

        _validateIntermediateHash(_proof.signals, _bodyHashProof.signals);

        require(isMailServerKeyHash(bytes32(_proof.signals[0])), "Invalid mailserver key hash");

        // Signals [5:10] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 5, 10);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [17:19] is the packed amount, since this is a USDC amount we want to make sure the returned number is
        // properly padded to 6 decimals. If the parsed has more than 6 figures to the right of the decimal it will revert
        amount = _parseSignalArray(_proof.signals, 23, 25).stringToUint(0x2C, 6);

        // Signals [10:12] are the packed timestamp, the timestamp is returned as a string in the format, that we need to
        // parse and convert to a unix timestamp
        // Add the buffer to build in flexibility with L2 timestamps
        timestamp = _parseSignalArray(_proof.signals, 10, 12).stringToUint(0) + timestampBuffer;

        // Signals [19] is the packed onRamperIdHash
        onRamperIdHash = bytes32(_proof.signals[25]);

        // Signals [12:17] is the packed name of the Garanti account owner which must be hashed to get the offRamperNameHash
        offRamperNameHash = keccak256(abi.encodePacked(_parseSignalArray(_proof.signals, 12, 18)));

        // Signals [12:17] is the packed IBAN number which must be hashed to get the offRamperIdHash
        offRamperIdHash = keccak256(abi.encodePacked(_parseSignalArray(_proof.signals, 18, 23)));

        // Check if email has been used previously, if not nullify it so it can't be used again
        _validateAndAddNullifier(bytes32(_proof.signals[26]));

        // Signals [14] is intentHash
        intentHash = bytes32(_proof.signals[27]);
    }
    
    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[28] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString(signalArray.length * PACK_SIZE, PACK_SIZE);
    }

    function _validateIntermediateHash(uint256[28] calldata _sendSignals, uint256[4] calldata _bodyHashSignals) internal pure {
        bytes32 intermediateHash = keccak256(abi.encode(_sendSignals[1], _sendSignals[2], _sendSignals[3], _sendSignals[4]));
        bytes32 inputHash = keccak256(abi.encode(_bodyHashSignals[0], _bodyHashSignals[1], _bodyHashSignals[2], _bodyHashSignals[3]));
        require(intermediateHash == inputHash, "Invalid intermediate or output hash");
    }
}
