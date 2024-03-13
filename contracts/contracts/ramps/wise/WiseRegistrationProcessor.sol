//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ITLSData } from "./interfaces/ITLSData.sol";
import { IWiseRegistrationProcessor } from "./interfaces/IWiseRegistrationProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseRegistrationProcessor is IWiseRegistrationProcessor, TLSBaseProcessor {

    using ECDSA for bytes32;
    using SignatureChecker for address;
    using StringConversionUtils for string;
    
    /* ============ Events ============ */
    event AccountTLSParamsSet(ITLSData.TLSParams tlsParams);
    event OffRamperTLSParamsSet(ITLSData.TLSParams tlsParams);
    
    /* ============ Public Variables ============ */
    ITLSData.TLSParams public accountTLSParams;
    ITLSData.TLSParams public offRamperTLSParams;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer,
        ITLSData.TLSParams memory _accountTLSParams,
        ITLSData.TLSParams memory _offRamperTLSParams
    )
        TLSBaseProcessor(
            _ramp,
            _nullifierRegistry,
            _timestampBuffer
        )
    {
        accountTLSParams = _accountTLSParams;
        offRamperTLSParams = _offRamperTLSParams;
    }

    /* ============ External Functions ============ */

    function processAccountProof(
        IWiseRegistrationProcessor.RegistrationProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(bytes32 onRampId, bytes32 wiseTagHash)
    {
        _validateNotarySignature(_proof.public_values, _proof.proof);

        ITLSData.TLSParams memory passedTLSParams = ITLSData.TLSParams({
            verifier: address(0),                                 // Verifier not checked in validateTLSParams
            endpoint: _proof.public_values.endpoint,
            host: _proof.public_values.host
        });

        _validateTLSParams(accountTLSParams, passedTLSParams);
        _validateAndAddNullifier(keccak256(abi.encode("registration", _proof.public_values.profileId)));

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
        wiseTagHash = bytes32(_proof.public_values.wiseTagHash.stringToUint(0));
    }

    function processOffRamperProof(
        IWiseRegistrationProcessor.OffRamperRegistrationProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(bytes32 onRampId, bytes32 offRampId)
    {
        _validateOffRamperNotarySignature(_proof.public_values, _proof.proof);

        ITLSData.TLSParams memory passedTLSParams = ITLSData.TLSParams({
            verifier: address(0),                                 // Notary not checked in validateTLSParams
            endpoint: _proof.public_values.endpoint,
            host: _proof.public_values.host
        });
        ITLSData.TLSParams memory expectedTLSParams = ITLSData.TLSParams({
            verifier: address(0),                                 // Notary not checked in validateTLSParams
            endpoint: offRamperTLSParams.endpoint.replaceString("*", _proof.public_values.profileId),
            host: offRamperTLSParams.host
        });

        _validateTLSParams(expectedTLSParams, passedTLSParams);
        _validateAndAddNullifier(keccak256(abi.encode("registration", _proof.public_values.mcAccountId)));

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
        offRampId = bytes32(_proof.public_values.mcAccountId.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setAccountTLSParams(ITLSData.TLSParams calldata _tlsParams) external onlyOwner {
        accountTLSParams = _tlsParams;

        emit AccountTLSParamsSet(_tlsParams);
    }

    function setOffRamperTLSParams(ITLSData.TLSParams calldata _tlsParams) external onlyOwner {
        offRamperTLSParams = _tlsParams;

        emit OffRamperTLSParamsSet(_tlsParams);
    }

    /* ============ External Getters ============ */

    function getAccountTLSParams() external view returns(ITLSData.TLSParams memory) {
        return accountTLSParams;
    }

    function getOffRamperTLSParams() external view returns(ITLSData.TLSParams memory) {
        return offRamperTLSParams;
    }

    /* ============ Internal Functions ============ */

    function _validateNotarySignature(
        IWiseRegistrationProcessor.RegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        bytes memory encodedMessage = abi.encode(_publicValues.endpoint, _publicValues.host, _publicValues.profileId, _publicValues.wiseTagHash);
        bytes32 verifierPayload = keccak256(encodedMessage).toEthSignedMessageHash();

        require(
            accountTLSParams.verifier.isValidSignatureNow(verifierPayload, _proof),
            "Invalid signature from verifier"
        );
    }

    function _validateOffRamperNotarySignature(
        IWiseRegistrationProcessor.OffRamperRegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        bytes memory encodedMessage = abi.encode(_publicValues.endpoint, _publicValues.host, _publicValues.profileId, _publicValues.mcAccountId);
        bytes32 verifierPayload = keccak256(encodedMessage).toEthSignedMessageHash();

        require(
            offRamperTLSParams.verifier.isValidSignatureNow(verifierPayload, _proof),
            "Invalid signature from verifier"
        );
    }
}
