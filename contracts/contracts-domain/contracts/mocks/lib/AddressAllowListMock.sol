//SPDX-License-Identifier: MIT

import { AddressAllowList } from "../../lib/AddressAllowList.sol";

pragma solidity ^0.8.18;

contract AddressAllowListMock is AddressAllowList {
    bool public stateUpdated;

    constructor(address[] memory _allowedAddresses) AddressAllowList(_allowedAddresses) {}

    function getAllowedAddresses() external view returns (address[] memory) {
        return _getAllowedAddresses();
    }

    function testOnlyAllowed() external onlyAllowed() {
        stateUpdated = true;
    }
}
