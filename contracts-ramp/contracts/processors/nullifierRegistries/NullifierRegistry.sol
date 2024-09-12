//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { AddressArrayUtils } from "../../external/AddressArrayUtils.sol";
import { INullifierRegistry } from "./INullifierRegistry.sol";

pragma solidity ^0.8.18;

contract NullifierRegistry is Ownable, INullifierRegistry {

    using AddressArrayUtils for address[];
    
    /* ============ Events ============ */
    event NullifierAdded(bytes32 nullifier, address indexed writer);
    event WriterAdded(address writer);
    event WriterRemoved(address writer);

    /* ============ Modifiers ============ */
    modifier onlyWriter() {
        require(isWriter[msg.sender], "Only addresses with write permissions can call");
        _;
    }

    /* ============ State Variables ============ */
    mapping(bytes32 => bool) public isNullified;
    mapping(address => bool) public isWriter;
    address[] public writers;

    /* ============ Constructor ============ */
    constructor() Ownable() {}
    
    /* ============ External Functions ============ */

    /**
     * ONLY WRITER: Only addresses with permission to write to this contract can call. Stores a nullifier for an email.
     *
     * @param _nullifier    The nullifier to store
     */
    function addNullifier(bytes32 _nullifier) external onlyWriter {
        require(!isNullified[_nullifier], "Nullifier already exists");

        isNullified[_nullifier] = true;

        emit NullifierAdded(_nullifier, msg.sender);
    }

    /* ============ Admin Functions ============ */

    /**
     * ONLY OWNER: Add address that has write permissions to the registry. Writer must not have been previously added.
     *
     * @param _newWriter    The nullifier to store
     */
    function addWritePermission(address _newWriter) external onlyOwner {
        require(!isWriter[_newWriter], "Address is already a writer");

        isWriter[_newWriter] = true;
        writers.push(_newWriter);

        emit WriterAdded(_newWriter);
    }

    /**
     * ONLY OWNER: Remove address that has write permissions to the registry. Writer must have been previously added.
     *
     * @param _removedWriter    The nullifier to store
     */
    function removeWritePermission(address _removedWriter) external onlyOwner {
        require(isWriter[_removedWriter], "Address is not a writer");

        isWriter[_removedWriter] = false;
        writers.removeStorage(_removedWriter);

        emit WriterRemoved(_removedWriter);
    }

    /* ============ External View Functions ============ */

    function getWriters() external view returns(address[] memory) {
       return writers;
    }
}
