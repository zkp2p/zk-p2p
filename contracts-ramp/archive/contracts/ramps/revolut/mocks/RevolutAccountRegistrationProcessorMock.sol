//SPDX-License-Identifier: MIT

import { IRevolutAccountRegistrationProcessor } from "../interfaces/IRevolutAccountRegistrationProcessor.sol";
import { StringConversionUtils } from "../../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract RevolutAccountRegistrationProcessorMock is IRevolutAccountRegistrationProcessor {

    using StringConversionUtils for string;

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        RegistrationProof calldata _proof
    )
        public
        pure
        override
        returns(bytes32 onRampId)
    {
        return bytes32(_proof.public_values.profileId.stringToUint(0));
    }
}
