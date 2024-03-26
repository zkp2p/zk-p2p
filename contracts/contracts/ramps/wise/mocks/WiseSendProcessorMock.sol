//SPDX-License-Identifier: MIT

import { IWiseSendProcessor } from "../interfaces/IWiseSendProcessor.sol";
import { StringConversionUtils } from "../../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract WiseSendProcessorMock is IWiseSendProcessor {

    using StringConversionUtils for string;

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        SendProof calldata _proof,
        address /*_verifierSigningKey*/
    )
        public
        pure
        override
        returns(
            uint256 amount,
            uint256 timestamp,
            bytes32 offRamperIdHash,
            bytes32 onRamperIdHash,
            bytes32 currencyId
        )
    {
        return(
            _proof.public_values.amount.stringToUint(6),
            _proof.public_values.timestamp.stringToUint(0),
            bytes32(_proof.public_values.recipientId.stringToUint(0)),
            bytes32(_proof.public_values.senderId.stringToUint(0)),
            keccak256(abi.encodePacked(_proof.public_values.currencyId))
        );
    }
}
