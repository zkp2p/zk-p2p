//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ITLSData } from "./interfaces/ITLSData.sol";
import { IWiseAccountRegistrationProcessor } from "./interfaces/IWiseAccountRegistrationProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseAccountRegistrationProcessor is IWiseAccountRegistrationProcessor, TLSBaseProcessor {

    using ECDSA for bytes32;
    using SignatureChecker for address;
    using StringConversionUtils for string;
    
    /* ============ Events ============ */
    event AccountTLSParamsSet(ITLSData.TLSParams tlsParams);
    
    /* ============ Public Variables ============ */
    ITLSData.TLSParams public accountTLSParams;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        INullifierRegistry _nullifierRegistry,
        uint256 _timestampBuffer,
        ITLSData.TLSParams memory _accountTLSParams
    )
        TLSBaseProcessor(
            _ramp,
            _nullifierRegistry,
            _timestampBuffer
        )
    {
        accountTLSParams = _accountTLSParams;
    }

    /* ============ External Functions ============ */

    function processAccountProof(
        IWiseAccountRegistrationProcessor.RegistrationProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(bytes32 onRampId, bytes32 wiseTagHash)
    {
        _validateProof(_proof.public_values, _proof.proof);

        _validateTLSEndpoint(accountTLSParams.endpoint, _proof.public_values.endpoint);
        _validateTLSHost(accountTLSParams.host, _proof.public_values.host);

        _validateAndAddNullifier(keccak256(abi.encode("registration", _proof.public_values.profileId)));

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
        wiseTagHash = bytes32(_proof.public_values.wiseTagHash.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setAccountTLSParams(ITLSData.TLSParams calldata _tlsParams) external onlyOwner {
        accountTLSParams = _tlsParams;

        emit AccountTLSParamsSet(_tlsParams);
    }

    /* ============ External Getters ============ */

    function getAccountTLSParams() external view returns(ITLSData.TLSParams memory) {
        return accountTLSParams;
    }

    /* ============ Internal Functions ============ */

    function _validateProof(
        IWiseAccountRegistrationProcessor.RegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        bytes memory encodedMessage = abi.encode(_publicValues.endpoint, _publicValues.host, _publicValues.profileId, _publicValues.wiseTagHash);
        _validateVerifierSignature(encodedMessage, _proof, accountTLSParams.verifier);
    }
}
