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

    using ECDSA for bytes;
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
        returns(bytes32 userIdHash)
    {
        bytes32 notaryPayload = abi.encode(_proof.public_values).toEthSignedMessageHash();
        require(
            tlsParams.notary.isValidSignatureNow(notaryPayload, _proof.proof),
            "Invalid signature from notary"
        );

        ITLSData.TLSParams memory passedTLSParams = ITLSData.TLSParams({
            notary: address(0),                     // Not checked in this function
            endpoint: _proof.public_values.endpoint,
            endpointType: _proof.public_values.endpointType,
            host: _proof.public_values.host
        });

        _validateTLSParams(tlsParams, passedTLSParams);
        _validateAndAddNullifier(keccak256(abi.encodePacked("registration", _proof.public_values.accountId)));

        return bytes32(_proof.public_values.accountId.stringToUint(0));
    }

    /* ============ External Admin Functions ============ */

    function setTLSParams(ITLSData.TLSParams calldata _tlsParams) external onlyOwner {
        tlsParams = _tlsParams;

        emit TLSParamsSet(_tlsParams);
    }
}
