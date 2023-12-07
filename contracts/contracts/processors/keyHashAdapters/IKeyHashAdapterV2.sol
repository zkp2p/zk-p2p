//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IKeyHashAdapterV2 {
    function addMailServerKeyHash(bytes32 _mailserverKeyHash) external;
    function removeMailServerKeyHash(bytes32 _mailserverKeyHash) external;
    function getMailServerKeyHashes() external view returns (bytes32[] memory);
    function isMailServerKeyHash(bytes32 _mailserverKeyHash) external view returns (bool);
}
