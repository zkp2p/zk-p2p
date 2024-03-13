//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { IKeyHashAdapterV2 } from "../../processors/keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ITLSData } from "./interfaces/ITLSData.sol";
import { IWiseSendProcessor } from "./interfaces/IWiseSendProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseSendProcessor is IWiseSendProcessor, TLSBaseProcessor {

    using ECDSA for bytes32;
    using SignatureChecker for address;
    using StringConversionUtils for string;

    /* ============ Constants ============ */
    bytes32 public constant PAYMENT_STATUS = keccak256(abi.encodePacked("OUTGOING_PAYMENT_SENT"));

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer
    )
        TLSBaseProcessor(
            _ramp,
            _nullifierRegistry,
            _timestampBuffer
        )
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        IWiseSendProcessor.SendProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperId,
            bytes32 onRamperId,
            bytes32 intentHash,
            bytes32 currencyId
        )
    {
        _validateNotarySignature(_proof.expectedTLSParams.verifier, _proof.public_values, _proof.proof);

        ITLSData.TLSParams memory passedTLSParams = ITLSData.TLSParams({
            verifier: address(0),                                 // Notary not checked in validateTLSParams
            endpoint: _proof.public_values.endpoint,
            host: _proof.public_values.host
        });
        ITLSData.TLSParams memory expectedTLSParams = ITLSData.TLSParams({
            verifier: address(0),                                 // Notary not checked in validateTLSParams
            endpoint: _proof.expectedTLSParams.endpoint.replaceString("*", _proof.public_values.senderId),
            host: _proof.expectedTLSParams.host
        });

        _validateTLSParams(expectedTLSParams, passedTLSParams);
        // Validate status
        require(
            keccak256(abi.encodePacked(_proof.public_values.status)) == PAYMENT_STATUS,
            "Payment status not confirmed as sent"
        );
        _validateAndAddNullifier(keccak256(abi.encodePacked("Wise", _proof.public_values.transferId)));

        amount = _proof.public_values.amount.stringToUint(6);

        // Add the buffer to build in flexibility with L2 timestamps
        timestamp = _proof.public_values.timestamp.stringToUint(0) / 1000 + timestampBuffer;

        offRamperId = bytes32(_proof.public_values.recipientId.stringToUint(0));
        onRamperId = bytes32(_proof.public_values.senderId.stringToUint(0));
        intentHash = bytes32(_proof.public_values.intentHash.stringToUint(0));
        currencyId = keccak256(abi.encodePacked(_proof.public_values.currencyId));
    }

    /* ============ Internal Functions ============ */

    function _validateNotarySignature(
        address _verifier,
        IWiseSendProcessor.SendData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        bytes memory encodedMessage = abi.encode(
            _publicValues.endpoint,
            _publicValues.host,
            _publicValues.transferId,
            _publicValues.senderId,
            _publicValues.recipientId,
            _publicValues.amount,
            _publicValues.currencyId,
            _publicValues.status,
            _publicValues.timestamp,
            _publicValues.intentHash
        );
        bytes32 verifierPayload = keccak256(encodedMessage).toEthSignedMessageHash();

        require(
            _verifier.isValidSignatureNow(verifierPayload, _proof),
            "Invalid signature from verifier"
        );
    }
}
