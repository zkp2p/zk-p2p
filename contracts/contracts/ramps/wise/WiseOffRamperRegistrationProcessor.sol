//SPDX-License-Identifier: MIT

import { INullifierRegistry } from "../../processors/nullifierRegistries/INullifierRegistry.sol";
import { ITLSData } from "./interfaces/ITLSData.sol";
import { IWiseOffRamperRegistrationProcessor } from "./interfaces/IWiseOffRamperRegistrationProcessor.sol";
import { StringConversionUtils } from "../../lib/StringConversionUtils.sol";
import { TLSBaseProcessor } from "../../processors/TLSBaseProcessor.sol";

pragma solidity ^0.8.18;

contract WiseOffRamperRegistrationProcessor is IWiseOffRamperRegistrationProcessor, TLSBaseProcessor {

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
        _validateProof(_proof.public_values, _proof.proof);

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

    function _validateProof(
        IWiseOffRamperRegistrationProcessor.OffRamperRegistrationData memory _publicValues, 
        bytes memory _proof
    )
        internal
        view
    {   
        bytes memory encodedMessage = abi.encode(_publicValues.endpoint, _publicValues.host, _publicValues.profileId, _publicValues.mcAccountId);
        _validateVerifierSignature(encodedMessage, _proof, offRamperTLSParams.verifierSigningKey);
    }
}
