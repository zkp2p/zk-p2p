//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IKeyHashAdapter } from "./IKeyHashAdapter.sol";

pragma solidity ^0.8.18;

contract ManagedKeyHashAdapter is Ownable , IKeyHashAdapter {
    
    /* ============ State Variables ============ */

    bytes32 public venmoMailserverKeyHash;

    /* ============ Constructor ============ */

    constructor(
        bytes32 _venmoMailserverKeyHash
    )
        Ownable()
    {
        venmoMailserverKeyHash = _venmoMailserverKeyHash;
    }

    /* ============ External Functions ============ */

    function setVenmoMailserverKeyHash(bytes32 _venmoMailserverKeyHash) external onlyOwner {
        venmoMailserverKeyHash = _venmoMailserverKeyHash;
    }
}
