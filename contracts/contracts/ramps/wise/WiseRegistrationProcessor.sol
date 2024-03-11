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
    event TLSParamsSet(ITLSData.TLSParams tlsParams);
    
    /* ============ Public Variables ============ */
    ITLSData.TLSParams public tlsParams;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer,
        ITLSData.TLSParams memory _tlsParams
    )
        TLSBaseProcessor(
            _ramp,
            _nullifierRegistry,
            _timestampBuffer
        )
    {
        tlsParams = _tlsParams;
    }

    /* ============ External Functions ============ */

    function processProof(
        IWiseRegistrationProcessor.RegistrationProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(bytes32 onRampId, bytes32 offRampId)
    {
        _validateNotarySignature(_proof.public_values, _proof.proof);

        ITLSData.TLSParams memory passedTLSParams = ITLSData.TLSParams({
            notary: address(0),                                 // Notary not checked in validateTLSParams
            endpoint: _proof.public_values.endpoint,
            host: _proof.public_values.host
        });

        _validateTLSParams(tlsParams, passedTLSParams);
        _validateAndAddNullifier(keccak256(abi.encode("registration", _proof.public_values.profileId)));

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
        offRampId = bytes32(_proof.public_values.mcAccountId.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setTLSParams(ITLSData.TLSParams calldata _tlsParams) external onlyOwner {
        tlsParams = _tlsParams;

        emit TLSParamsSet(_tlsParams);
    }

    /* ============ External Getters ============ */

    function getTLSParams() external view returns(ITLSData.TLSParams memory) {
        return tlsParams;
    }

    /* ============ Internal Functions ============ */

    function _validateNotarySignature(
        IWiseRegistrationProcessor.RegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        bytes memory encodedMessage = abi.encode(_publicValues.endpoint, _publicValues.host, _publicValues.profileId, _publicValues.mcAccountId);
        bytes32 notaryPayload = keccak256(encodedMessage).toEthSignedMessageHash();

        require(
            tlsParams.notary.isValidSignatureNow(notaryPayload, _proof),
            "Invalid signature from notary"
        );
    }
}
