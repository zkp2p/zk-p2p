//SPDX-License-Identifier: MIT

import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { IWiseOffRamperRegistrationProcessor } from "./interfaces/IWiseOffRamperRegistrationProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseOffRamperRegistrationProcessor is IWiseOffRamperRegistrationProcessor, TLSBaseProcessor {

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

    function processProof(
        IWiseOffRamperRegistrationProcessor.OffRamperRegistrationProof calldata _proof
    )
        public
        view
        override
        onlyRamp
        returns(bytes32 onRampId, bytes32 offRampId)
    {
        _validateProof(_proof.public_values, _proof.proof);

        _validateTLSEndpoint(endpoint.replaceString("*", _proof.public_values.profileId), _proof.public_values.endpoint);
        _validateTLSHost(host, _proof.public_values.host);

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
        offRampId = bytes32(_proof.public_values.mcAccountId.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setVerifierSigningKey(address _verifierSigningKey) external onlyOwner {
        verifierSigningKey = _verifierSigningKey;

        emit VerifierSigningKeySet(_verifierSigningKey);
    }

    /* ============ View Functions ============ */

    function verifyProof(
        IWiseOffRamperRegistrationProcessor.OffRamperRegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
        returns(bool)
    {   
        bytes memory encodedMessage = abi.encode(_publicValues.endpoint, _publicValues.host, _publicValues.profileId, _publicValues.mcAccountId);
        return _isValidVerifierSignature(encodedMessage, _proof, verifierSigningKey);
    }

    /* ============ Internal Functions ============ */

    function _validateProof(
        IWiseOffRamperRegistrationProcessor.OffRamperRegistrationData memory _publicValues, 
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
