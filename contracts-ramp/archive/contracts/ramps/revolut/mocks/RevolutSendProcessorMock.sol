//SPDX-License-Identifier: MIT

import { IRevolutSendProcessor } from "../interfaces/IRevolutSendProcessor.sol";
import { StringConversionUtils } from "../../../lib/StringConversionUtils.sol";

pragma solidity ^0.8.18;

contract RevolutSendProcessorMock is IRevolutSendProcessor {

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
            bytes32 revolutTagHash,
            bytes32 currencyId,
            bytes32 notaryKeyHash
        )
    {
        return(
            _proof.public_values.amount.stringToUint(6),
            _proof.public_values.timestamp.stringToUint(0),
            keccak256(abi.encodePacked(_proof.public_values.recipientId)),
            keccak256(abi.encodePacked(_proof.public_values.currencyId)),
            bytes32(_proof.public_values.notaryKeyHash)
        );
    }
}
