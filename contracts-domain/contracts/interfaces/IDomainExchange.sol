//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


interface IDomainExchange {
    function registryRemoveListing(uint256 _listingId) external;
}