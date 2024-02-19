//SPDX-License-Identifier: MIT

import { IGarantiBodyHashVerifier } from "../interfaces/IGarantiBodyHashVerifier.sol";
import { IGarantiRegistrationProcessor } from "../interfaces/IGarantiRegistrationProcessor.sol";

pragma solidity ^0.8.18;

contract GarantiRegistrationProcessorMock is IGarantiRegistrationProcessor {

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External View Functions ============ */
    function processProof(
        RegistrationProof calldata _proof,
        IGarantiBodyHashVerifier.BodyHashProof calldata /*_bodyHashProof*/
    )
        public
        pure
        override
        returns(bytes32 userIdHash)
    {
        return(bytes32(_proof.signals[1]));
    }
}
