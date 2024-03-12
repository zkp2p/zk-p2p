//SPDX-License-Identifier: MIT

import { IWiseRegistrationProcessor } from "../interfaces/IWiseRegistrationProcessor.sol";
import { StringConversionUtils } from "../../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract WiseRegistrationProcessorMock is IWiseRegistrationProcessor {

    using StringConversionUtils for string;

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processAccountProof(
        RegistrationProof calldata _proof
    )
        public
        pure
        override
        returns(bytes32 onRampId, bytes32 wiseTagHash)
    {
        return(
            bytes32(_proof.public_values.profileId.stringToUint(0)),
            bytes32(_proof.public_values.wiseTagHash.stringToUint(0))
        );
    }


    function processOffRamperProof(
        OffRamperRegistrationProof calldata _proof
    )
        public
        pure
        override
        returns(bytes32 onRampId, bytes32 offRampId)
    {
        return(
            bytes32(_proof.public_values.profileId.stringToUint(0)),
            bytes32(_proof.public_values.mcAccountId.stringToUint(0))
        );
    }
}
