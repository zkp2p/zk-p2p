//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { IWiseAccountRegistrationProcessor } from "./interfaces/IWiseAccountRegistrationProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseAccountRegistrationProcessor is IWiseAccountRegistrationProcessor, TLSBaseProcessor {

    using ECDSA for bytes32;
    using SignatureChecker for address;
    using StringConversionUtils for string;
    
    /* ============ Events ============ */
    event VerifierSigningKeySet(address _verifierSigningKey);
    
    /* ============ Public Variables ============ */
    address public verifierSigningKey;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        address _verifierSigningKey,
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
    {
        verifierSigningKey = _verifierSigningKey;
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

        _validateTLSEndpoint(endpoint, _proof.public_values.endpoint);
        _validateTLSHost(host, _proof.public_values.host);

        _validateAndAddNullifier(keccak256(abi.encode("registration", _proof.public_values.profileId)));

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
        wiseTagHash = bytes32(_proof.public_values.wiseTagHash.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setVerifierSigningKey(address _verifierSigningKey) external onlyOwner {
        verifierSigningKey = _verifierSigningKey;

        emit VerifierSigningKeySet(_verifierSigningKey);
    }

    /* ============ View Functions ============ */

    function verifyProof(
        IWiseAccountRegistrationProcessor.RegistrationData memory _publicValues,
        bytes memory _proof
    )
        public
        view
        returns(bool)
    {
        bytes memory encodedMessage = abi.encode(_publicValues.endpoint, _publicValues.host, _publicValues.profileId, _publicValues.wiseTagHash);
        return _isValidVerifierSignature(encodedMessage, _proof, verifierSigningKey);
    }
    
    /* ============ Internal Functions ============ */

    function _validateProof(
        IWiseAccountRegistrationProcessor.RegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        require(
            verifyProof(_publicValues, _proof),
            "Invalid signature from verifier"
        );
    }
}
