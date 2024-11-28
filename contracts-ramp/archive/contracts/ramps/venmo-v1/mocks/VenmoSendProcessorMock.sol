//SPDX-License-Identifier: MIT

import { ISendProcessor } from "../interfaces/ISendProcessor.sol";

pragma solidity ^0.8.18;

contract VenmoSendProcessorMock is ISendProcessor {

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        SendProof calldata _proof
    )
        public
        pure
        override
        returns(uint256 amount, uint256 timestamp, bytes32 offRamperIdHash, bytes32 onRamperIdHash, bytes32 intentHash)
    {
        return(_proof.signals[0], _proof.signals[1], bytes32(_proof.signals[2]), bytes32(_proof.signals[3]), bytes32(_proof.signals[4]));
    }
}
