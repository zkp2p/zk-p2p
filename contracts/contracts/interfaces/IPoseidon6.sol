//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IPoseidon6 {
    function poseidon(uint256[6] memory _a) external pure returns(uint256);
}
