//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IKeyHashAdapter {
    function setVenmoMailserverKeyHash(bytes32 _venmoMailserverKeyHash) external;
    function venmoMailserverKeyHash() external view returns (bytes32);
}
