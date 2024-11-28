//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { IKeyHashAdapterV2 } from "../../processors/keyHashAdapters/IKeyHashAdapterV2.sol";
import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { IRevolutSendProcessor } from "./interfaces/IRevolutSendProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract RevolutSendProcessor is IRevolutSendProcessor, TLSBaseProcessor {

    using ECDSA for bytes32;
    using SignatureChecker for address;
    using StringConversionUtils for string;

    /* ============ Constants ============ */
    bytes32 public constant PAYMENT_STATUS = keccak256(abi.encodePacked("COMPLETED"));

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer,
        string memory _endpoint,
        string memory _host
    )
        TLSBaseProcessor(
            _ramp,
            _nullifierRegistry,
            _timestampBuffer,
            _endpoint,
            _host
        )
    {}
    
    /* ============ External Functions ============ */
    function processProof(
        IRevolutSendProcessor.SendProof calldata _proof,
        address _verifierSigningKey
    )
        public
        override
        onlyRamp
        returns(
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperId,
            bytes32 currencyId,
            bytes32 notaryKeyHash
        )
    {
        _validateProof(_verifierSigningKey, _proof.public_values, _proof.proof);

        _validateTLSEndpoint(
            endpoint.replaceString("*", _proof.public_values.transferId),
            _proof.public_values.endpoint
        );
        _validateTLSHost(host, _proof.public_values.host);
        
        // Validate status
        require(
            keccak256(abi.encodePacked(_proof.public_values.status)) == PAYMENT_STATUS,
            "Payment status not confirmed as sent"
        );
        _validateAndAddNullifier(keccak256(abi.encodePacked("Revolut", _proof.public_values.transferId)));

        amount = _parseAmount(_proof.public_values.amount);

        // Add the buffer to build in flexibility with L2 timestamps
        timestamp = _proof.public_values.timestamp.stringToUint(0) / 1000 + timestampBuffer;

        offRamperId = keccak256(abi.encodePacked(_proof.public_values.recipientId));
        currencyId = keccak256(abi.encodePacked(_proof.public_values.currencyId));
        notaryKeyHash = bytes32(_proof.public_values.notaryKeyHash);
    }

    /* ============ View Functions ============ */

    function verifyProof(
        address _verifierSigningKey,
        IRevolutSendProcessor.SendData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
        returns(bool)
    {   
        bytes memory encodedMessage = abi.encode(
            _publicValues.endpoint,
            _publicValues.host,
            _publicValues.transferId,
            _publicValues.recipientId,
            _publicValues.amount,
            _publicValues.currencyId,
            _publicValues.status,
            _publicValues.timestamp,
            _publicValues.intentHash,
            _publicValues.notaryKeyHash
        );
        return _isValidSignature(encodedMessage, _proof, _verifierSigningKey);
    }

    /* ============ Internal Functions ============ */

    function _validateProof(
        address _verifierSigningKey,
        IRevolutSendProcessor.SendData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        require(
            verifyProof(_verifierSigningKey, _publicValues, _proof),
            "Invalid proof"
        );
    }

    function _parseAmount(string memory amount) internal pure returns(uint256) {
        // For send transactions, the amount is prefixed with a '-' character, if the character doesn't exist then
        // it would be a receive transaction
        require(bytes(amount)[0] == 0x2D, "Not a send transaction");   
        return amount.stringToUint(6);
    }
}
