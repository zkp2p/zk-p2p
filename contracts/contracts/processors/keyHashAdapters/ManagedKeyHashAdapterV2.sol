//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IKeyHashAdapterV2 } from "./IKeyHashAdapterV2.sol";
import { Bytes32ArrayUtils } from "../../external/Bytes32ArrayUtils.sol";

pragma solidity ^0.8.18;

contract ManagedKeyHashAdapterV2 is Ownable, IKeyHashAdapterV2 {
    
    using Bytes32ArrayUtils for bytes32[];

    /* ============ Events ============ */
    event MailServerKeyHashAdded(bytes32 mailserverKeyHash);
    event MailServerKeyHashRemoved(bytes32 mailserverKeyHash);

    /* ============ State Variables ============ */

    mapping(bytes32 => bool) public isMailServerKeyHash;
    bytes32[] public mailServerKeyHashes;

    /* ============ Constructor ============ */

    constructor(
        bytes32[] memory _mailServerKeyHashes
    )
        Ownable()
    {
        for (uint256 i = 0; i < _mailServerKeyHashes.length; i++) {
            bytes32 mailserverKeyHash = _mailServerKeyHashes[i];
            require(!isMailServerKeyHash[mailserverKeyHash], "Key hash already added");
            
            isMailServerKeyHash[mailserverKeyHash] = true;
            mailServerKeyHashes.push(mailserverKeyHash);
        }
    }

    /* ============ External Functions ============ */

    function addMailServerKeyHash(bytes32 _mailserverKeyHash) external onlyOwner {
        require(!isMailServerKeyHash[_mailserverKeyHash], "Key hash already added");

        isMailServerKeyHash[_mailserverKeyHash] = true;
        mailServerKeyHashes.push(_mailserverKeyHash);

        emit MailServerKeyHashAdded(_mailserverKeyHash);
    }

    function removeMailServerKeyHash(bytes32 _mailserverKeyHash) external onlyOwner {
        require(isMailServerKeyHash[_mailserverKeyHash], "Key hash not added");

        isMailServerKeyHash[_mailserverKeyHash] = false;
        mailServerKeyHashes.removeStorage(_mailserverKeyHash);

        emit MailServerKeyHashRemoved(_mailserverKeyHash);
    }

    /* ============ External Getter Functions ============ */

    function getMailServerKeyHashes() external view override returns (bytes32[] memory) {
        return mailServerKeyHashes;
    }
}
