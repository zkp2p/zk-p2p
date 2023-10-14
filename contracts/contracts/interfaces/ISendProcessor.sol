//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface ISendProcessor {

    struct SendProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[10] signals;
    }

    function processProof(
        SendProof calldata _proof
    )
        external
    returns(uint256, uint256, bytes32, bytes32);
}
