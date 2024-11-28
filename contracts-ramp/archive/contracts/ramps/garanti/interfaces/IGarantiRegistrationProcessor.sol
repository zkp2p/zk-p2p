//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { IGarantiBodySuffixHashVerifier } from "./IGarantiBodySuffixHashVerifier.sol";

interface IGarantiRegistrationProcessor {

    struct RegistrationProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[11] signals;
    }

    function processProof(
        RegistrationProof calldata _proof,
        IGarantiBodySuffixHashVerifier.BodySuffixHashProof calldata _bodyHashProof
    )
        external
    returns (bytes32);
}
