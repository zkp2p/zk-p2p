//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IKeyHashAdapter {
    function setMailserverKeyHash(bytes32 _mailserverKeyHash) external;
    function mailserverKeyHash() external view returns (bytes32);
}
