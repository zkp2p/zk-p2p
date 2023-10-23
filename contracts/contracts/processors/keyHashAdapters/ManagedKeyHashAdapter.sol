//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IKeyHashAdapter } from "./IKeyHashAdapter.sol";

pragma solidity ^0.8.18;

contract ManagedKeyHashAdapter is Ownable, IKeyHashAdapter {
    
    /* ============ State Variables ============ */

    bytes32 public mailserverKeyHash;

    /* ============ Constructor ============ */

    constructor(
        bytes32 _mailserverKeyHash
    )
        Ownable()
    {
        mailserverKeyHash = _mailserverKeyHash;
    }

    /* ============ External Functions ============ */

    function setMailserverKeyHash(bytes32 _mailserverKeyHash) external onlyOwner {
        mailserverKeyHash = _mailserverKeyHash;
    }
}
