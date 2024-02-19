//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { IGarantiBodyHashVerifier } from "./IGarantiBodyHashVerifier.sol";

interface IGarantiSendProcessor {

    struct SendProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[22] signals;
    }

    function processProof(
        SendProof calldata _proof,
        IGarantiBodyHashVerifier.BodyHashProof calldata _bodyHashProof
    )
        external
    returns(uint256, uint256, bytes32, bytes32, bytes32);
}
