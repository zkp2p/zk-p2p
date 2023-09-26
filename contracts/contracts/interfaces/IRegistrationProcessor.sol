//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IRegistrationProcessor {

    struct RegistrationProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[8] signals;
    }

    function processProof(
        RegistrationProof calldata _proof
    )
        external
        view
    returns (bytes32);
}
