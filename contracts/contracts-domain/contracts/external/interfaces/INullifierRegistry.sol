//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface INullifierRegistry {
    function addNullifier(bytes32 _nullifier) external;
    function isNullified(bytes32 _nullifier) external view returns(bool);
}
