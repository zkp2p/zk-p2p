//SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { BaseProcessorV2 } from "../../processors/BaseProcessorV2.sol";
import { Groth16Verifier } from "../../verifiers/garanti_registration_verifier.sol";
import { IGarantiBodyHashVerifier } from "./interfaces/IGarantiBodyHashVerifier.sol";
import { IGarantiRegistrationProcessor } from "./interfaces/IGarantiRegistrationProcessor.sol";
import { IKeyHashAdapterV2 } from "../../processors/keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";

pragma solidity ^0.8.18;

contract GarantiRegistrationProcessor is
    Groth16Verifier,
    IGarantiRegistrationProcessor,
    BaseProcessorV2
{

    using StringUtils for uint256[];

    /* ============ Constants ============ */
    uint256 constant public PACK_SIZE = 7;

        /* ============ Public Variables ============ */
    IGarantiBodyHashVerifier public bodyHashVerifier;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapterV2 _garantiMailserverKeyHashAdapter,
        INullifierRegistry _nullifierRegistry,
        IGarantiBodyHashVerifier _bodyHashVerifier,
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
        IGarantiRegistrationProcessor.RegistrationProof calldata _proof,
        IGarantiBodyHashVerifier.BodyHashProof calldata _bodyHashProof
    )
        public
        override
        onlyRamp
        returns(bytes32 userIdHash)
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

        _validateAndAddNullifier(keccak256(abi.encode(_proof)));

        // Signals [10] is the packed userIdHash
        userIdHash = bytes32(_proof.signals[10]);
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[11] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString(signalArray.length * PACK_SIZE, PACK_SIZE);
    }

    function _validateIntermediateHash(uint256[11] calldata _sendSignals, uint256[4] calldata _bodyHashSignals) internal pure {
        bytes32 intermediateHash = keccak256(abi.encode(_sendSignals[1], _sendSignals[2], _sendSignals[3], _sendSignals[4]));
        bytes32 inputHash = keccak256(abi.encode(_bodyHashSignals[0], _bodyHashSignals[1], _bodyHashSignals[2], _bodyHashSignals[3]));
        require(intermediateHash == inputHash, "Invalid intermediate or output hash");
    }
}
