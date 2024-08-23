//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { AddressArrayUtils } from "./lib/AddressArrayUtils.sol";

pragma solidity ^0.8.18;

contract AddressAllowList is Ownable {

    using AddressArrayUtils for address[];

    /* ============ Events ============ */
    event AddressAddedToAllowlist(address indexed allowedAddress);
    event AddressRemovedFromAllowlist(address indexed allowedAddress);
    event AllowlistEnabled();
    event AllowlistDisabled();
    
    /* ============ Modifier ============ */
    modifier onlyAllowed() {
        require(isEnabled ? isAllowed[msg.sender] : true, "Address is not allowed");
        _;
    }
    
    /* ============ State Variables ============ */
    bool public isEnabled;                     // Boolean indicating if the allowlist is enabled
    address[] public allowedAddresses;         // Array of addresses that are allowed from taking depositors liquidity
    mapping(address => bool) public isAllowed; // Mapping of address to boolean indicating if the user is allowed

    /* ============ Constructor ============ */
    constructor(address[] memory _allowedAddresses) Ownable() {
        for (uint256 i = 0; i < _allowedAddresses.length; i++) {
            address allowedAddress = _allowedAddresses[i];

            require(!isAllowed[allowedAddress], "Address is already allowed");
            isAllowed[allowedAddress] = true;
            emit AddressAddedToAllowlist(allowedAddress);
        }
        allowedAddresses = _allowedAddresses;
        isEnabled = true;
    }

    /* ============ External Functions ============ */

    /**
     * @notice Adds passed addresses to an allow list. Addresses on the allow list are able to call allow listed
     * functions.
     *
     * @param _allowedAddresses   List of addresses allowed to call allow listed functions
     */
    function addAddressesToAllowlist(address[] memory _allowedAddresses) external onlyOwner {
        for(uint256 i = 0; i < _allowedAddresses.length; i++) {
            address allowedAddress = _allowedAddresses[i];

            require(!isAllowed[allowedAddress], "Address already on allowlist");

            isAllowed[allowedAddress] = true;
            allowedAddresses.push(allowedAddress);

            emit AddressAddedToAllowlist(allowedAddress);
        }
    }

    /**
     * @notice Removes passed addresses from an allow list. Addresses not on the allow list are unable to call
     * allow listed functions.
     *
     * @param _disallowedAddresses   List of addresses being disallowed from calling allow listed functions
     */
    function removeAddressesFromAllowlist(address[] memory _disallowedAddresses) external onlyOwner {
        for(uint256 i = 0; i < _disallowedAddresses.length; i++) {
            address disallowedAddress = _disallowedAddresses[i];

            require(isAllowed[disallowedAddress], "Address already disallowed");

            isAllowed[disallowedAddress] = false;
            allowedAddresses.removeStorage(disallowedAddress);

            emit AddressRemovedFromAllowlist(disallowedAddress);
        }
    }

    /**
     * @notice Enable the allow list. When the allow list is enabled, only approved addresses are allowed to
     * functions with onlyAllowed modifier.
     */
    function enableAllowlist() external onlyOwner {
        require(!isEnabled, "Allow list is already enabled");

        isEnabled = true;
        emit AllowlistEnabled();
    }

    /**
     * @notice Disable the allow list. When the allow list is disabled, any address is allowed to call functions
     * with onlyAllowed modifier.
     */
    function disableAllowlist() external onlyOwner {
        require(isEnabled, "Allow list is already disabled");

        isEnabled = false;
        emit AllowlistDisabled();
    }

    /* ============ View Functions ============ */

    function _getAllowedAddresses() internal view returns (address[] memory) {
        return allowedAddresses;
    }
}
