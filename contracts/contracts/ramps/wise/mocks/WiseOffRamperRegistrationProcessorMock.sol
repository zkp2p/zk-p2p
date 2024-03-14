//SPDX-License-Identifier: MIT

import { IWiseOffRamperRegistrationProcessor } from "../interfaces/IWiseOffRamperRegistrationProcessor.sol";
import { StringConversionUtils } from "../../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract WiseOffRamperRegistrationProcessorMock is IWiseOffRamperRegistrationProcessor {

    using StringConversionUtils for string;

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processOffRamperProof(
       OffRamperRegistrationProof calldata _proof
    )
        public
        pure
        override
        returns(bytes32 onRampId, bytes32 wiseTagHash)
    {
        return(
            bytes32(_proof.public_values.profileId.stringToUint(0)),
            bytes32(_proof.public_values.mcAccountId.stringToUint(0))
        );
    }
}
