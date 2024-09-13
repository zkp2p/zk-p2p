//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IGarantiBodySuffixHashVerifier {

    struct BodySuffixHashProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[4] signals;
    }

    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals
    )
        external
        view
        returns (bool);
}
