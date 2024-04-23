//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IRevolutAccountRegistry {
    function getAccountId(address _account) external view returns (bytes32);
    function isRegisteredUser(address _account) external view returns (bool);
    function isAllowedUser(address _account, bytes32 _deniedUser) external view returns (bool);
}
