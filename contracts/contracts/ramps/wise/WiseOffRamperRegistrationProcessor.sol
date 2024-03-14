//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ITLSData } from "./interfaces/ITLSData.sol";
import { IWiseOffRamperRegistrationProcessor } from "./interfaces/IWiseOffRamperRegistrationProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseOffRamperRegistrationProcessor is IWiseOffRamperRegistrationProcessor, TLSBaseProcessor {

    using ECDSA for bytes32;
    using SignatureChecker for address;
    using StringConversionUtils for string;
    
    /* ============ Events ============ */
    event OffRamperTLSParamsSet(ITLSData.TLSParams tlsParams);
    
    /* ============ Public Variables ============ */
    ITLSData.TLSParams public offRamperTLSParams;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer,
        ITLSData.TLSParams memory _offRamperTLSParams
    )
        TLSBaseProcessor(
            _ramp,
            _nullifierRegistry,
            _timestampBuffer
        )
    {
        offRamperTLSParams = _offRamperTLSParams;
    }

    /* ============ External Functions ============ */

    function processOffRamperProof(
        IWiseOffRamperRegistrationProcessor.OffRamperRegistrationProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(bytes32 onRampId, bytes32 offRampId)
    {
        _validateOffRamperNotarySignature(_proof.public_values, _proof.proof);

        _validateTLSEndpoint(offRamperTLSParams.endpoint.replaceString("*", _proof.public_values.profileId), _proof.public_values.endpoint);
        _validateTLSHost(offRamperTLSParams.host, _proof.public_values.host);

        _validateAndAddNullifier(keccak256(abi.encode("registration", _proof.public_values.mcAccountId)));

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
        offRampId = bytes32(_proof.public_values.mcAccountId.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setOffRamperTLSParams(ITLSData.TLSParams calldata _tlsParams) external onlyOwner {
        offRamperTLSParams = _tlsParams;

        emit OffRamperTLSParamsSet(_tlsParams);
    }

    /* ============ External Getters ============ */

    function getOffRamperTLSParams() external view returns(ITLSData.TLSParams memory) {
        return offRamperTLSParams;
    }

    /* ============ Internal Functions ============ */

    function _validateOffRamperNotarySignature(
        IWiseOffRamperRegistrationProcessor.OffRamperRegistrationData memory _publicValues, 
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
