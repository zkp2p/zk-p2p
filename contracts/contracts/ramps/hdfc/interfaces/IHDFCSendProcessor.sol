//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IHDFCSendProcessor {

    struct SendProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[15] signals;
    }

    function processProof(
        SendProof calldata _proof
    )
        external
    returns(uint256, uint256, bytes32, bytes32, bytes32);
}
