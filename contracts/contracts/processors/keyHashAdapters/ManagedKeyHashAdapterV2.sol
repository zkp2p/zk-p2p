//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IKeyHashAdapterV2 } from "./IKeyHashAdapterV2.sol";
import { Bytes32ArrayUtils } from "../../external/Bytes32ArrayUtils.sol";

pragma solidity ^0.8.18;

contract ManagedKeyHashAdapterV2 is Ownable, IKeyHashAdapterV2 {
    
    using Bytes32ArrayUtils for bytes32[];

    /* ============ State Variables ============ */

    bytes32[] public mailserverKeyHashes;

    /* ============ Constructor ============ */

    constructor(
        bytes32[] memory _mailserverKeyHashes
    )
        Ownable()
    {
        for (uint256 i = 0; i < _mailserverKeyHashes.length; i++) {
            mailserverKeyHashes.push(_mailserverKeyHashes[i]);
        }
    }

    /* ============ External Functions ============ */

    function addMailServerKeyHash(bytes32 _mailserverKeyHash) external onlyOwner {
        mailserverKeyHashes.push(_mailserverKeyHash);
    }

    function removeMailServerKeyHash(bytes32 _mailserverKeyHash) external onlyOwner {
        mailserverKeyHashes.removeStorage(_mailserverKeyHash);
    }

    function isMailServerKeyHash(bytes32 _mailserverKeyHash) external view returns (bool) {
        return mailserverKeyHashes.contains(_mailserverKeyHash);
    }

    /* ============ External Getter Functions ============ */

    function getMailserverKeyHashes() external view override returns (bytes32[] memory) {
        return mailserverKeyHashes;
    }
}
