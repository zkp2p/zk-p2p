//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { WiseTimestampParsing } from "./lib/WiseTimestampParsing.sol";
import { IKeyHashAdapterV2 } from "../../processors/keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ITLSData } from "./interfaces/ITLSData.sol";
import { IWiseSendProcessor } from "./interfaces/IWiseSendProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseSendProcessor is IWiseSendProcessor, TLSBaseProcessor {

    using ECDSA for bytes;
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
        bytes32 notaryPayload = abi.encode(_proof.public_values).toEthSignedMessageHash();
        require(
            _proof.expectedTLSParams.notary.isValidSignatureNow(notaryPayload, _proof.proof),
            "Invalid signature from notary"
        );

        ITLSData.TLSParams memory passedTLSParams = ITLSData.TLSParams({
            notary: address(0),                                 // Notary not checked in validateTLSParams
            endpoint: _proof.public_values.endpoint,
            host: _proof.public_values.host
        });

        // Validate status
        require(
            keccak256(abi.encodePacked(_proof.public_values.status)) == PAYMENT_STATUS,
            "Payment status not confirmed as sent"
        );

        _validateTLSParams(_proof.expectedTLSParams, passedTLSParams);
        _validateAndAddNullifier(keccak256(abi.encode(_proof.public_values)));

        amount = _proof.public_values.amount.stringToUint(6);

        // Add the buffer to build in flexibility with L2 timestamps
        timestamp = WiseTimestampParsing._dateStringToTimestamp(_proof.public_values.timestamp) + timestampBuffer;

        offRamperId = bytes32(_proof.public_values.recipientId.stringToUint(0));
        onRamperId = bytes32(_proof.public_values.recipientId.stringToUint(0));
        intentHash = bytes32(_proof.public_values.intentHash.stringToUint(0));
        currencyId = keccak256(abi.encodePacked(_proof.public_values.currencyId));
    }
}
