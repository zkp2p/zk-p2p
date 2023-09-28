//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IPoseidon {
    function poseidon(uint256[3] memory _a) external pure returns(uint256);
}
