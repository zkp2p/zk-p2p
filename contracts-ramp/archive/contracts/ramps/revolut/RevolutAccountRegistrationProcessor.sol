//SPDX-License-Identifier: MIT

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { IRevolutAccountRegistrationProcessor } from "./interfaces/IRevolutAccountRegistrationProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract RevolutAccountRegistrationProcessor is IRevolutAccountRegistrationProcessor, TLSBaseProcessor {

    using ECDSA for bytes32;
    using SignatureChecker for address;
    using StringConversionUtils for string;
    
    /* ============ Events ============ */
    event VerifierSigningKeySet(address _verifierSigningKey);
    
    /* ============ Public Variables ============ */
    address public verifierSigningKey;
    bytes32 public notaryKeyHash;
    
    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        address _verifierSigningKey,
        bytes32 _notaryKeyHash,
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
        notaryKeyHash = _notaryKeyHash;
    }

    /* ============ External Functions ============ */

    function processProof(
        IRevolutAccountRegistrationProcessor.RegistrationProof calldata _proof
    )
        public
        override
        onlyRamp
        returns(bytes32 onRampId)
    {
        _validateProof(_proof.public_values, _proof.proof);

        _validateTLSEndpoint(endpoint, _proof.public_values.endpoint);
        _validateTLSHost(host, _proof.public_values.host);

        _validateAndAddNullifier(keccak256(abi.encode(_proof.public_values.userAddress, _proof.public_values.profileId)));

        onRampId = bytes32(_proof.public_values.profileId.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setVerifierSigningKey(address _verifierSigningKey) external onlyOwner {
        verifierSigningKey = _verifierSigningKey;

        emit VerifierSigningKeySet(_verifierSigningKey);
    }

    /* ============ View Functions ============ */

    function verifyProof(
        IRevolutAccountRegistrationProcessor.RegistrationData memory _publicValues,
        bytes memory _proof
    )
        public
        view
        returns(bool)
    {
        bytes memory encodedMessage = abi.encode(
            _publicValues.endpoint,
            _publicValues.host,
            _publicValues.profileId,
            _publicValues.userAddress,
            _publicValues.notaryKeyHash
        );

        require(bytes32(_publicValues.notaryKeyHash) == notaryKeyHash, "Invalid notary key hash");

        return _isValidSignature(encodedMessage, _proof, verifierSigningKey);
    }
    
    /* ============ Internal Functions ============ */

    function _validateProof(
        IRevolutAccountRegistrationProcessor.RegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        require(
            verifyProof(_publicValues, _proof),
            "Invalid proof"
        );
    }
}
