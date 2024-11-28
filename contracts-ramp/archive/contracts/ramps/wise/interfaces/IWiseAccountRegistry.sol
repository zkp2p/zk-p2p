//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IWiseAccountRegistry {

    // Each Account is tied to a Wise ID and is represented by an Ethereum address.
    struct AccountInfo {
        bytes32 accountId;                  // User's Wise account ID
        bytes32 offRampId;                  // Multi-currency account ID to receive funds
        bytes32 wiseTagHash;                // Hash of user's wise tag account stored on register. Used to verify offramper's wise tag
    }

    function getAccountInfo(address _account) external view returns (AccountInfo memory);
    function getAccountId(address _account) external view returns (bytes32);

    function isRegisteredUser(address _account) external view returns (bool);
    
    function isAllowedUser(address _account, bytes32 _deniedUser) external view returns (bool);
}
