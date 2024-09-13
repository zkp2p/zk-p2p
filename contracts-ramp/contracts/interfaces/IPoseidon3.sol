//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IPoseidon3 {
    function poseidon(uint256[3] memory _a) external pure returns(uint256);
}
