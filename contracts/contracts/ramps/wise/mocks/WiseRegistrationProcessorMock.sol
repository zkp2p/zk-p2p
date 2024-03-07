//SPDX-License-Identifier: MIT

import { IWiseRegistrationProcessor } from "../interfaces/IWiseRegistrationProcessor.sol";
import { StringConversionUtils } from "../../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract WiseRegistrationProcessorMock is IWiseRegistrationProcessor {

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
        returns(bytes32 userIdHash)
    {
        return(bytes32(_proof.public_values.accountId.stringToUint(0)));
    }
}
