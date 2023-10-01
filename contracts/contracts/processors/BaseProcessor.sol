//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IKeyHashAdapter } from "./keyHashAdapters/IKeyHashAdapter.sol";

pragma solidity ^0.8.18;

contract BaseProcessor is Ownable {

    /* ============ Modifiers ============ */
    modifier onlyRamp() {
        require(msg.sender == ramp, "Only Ramp can call this function");
        _;
    }
    
    /* ============ Constants ============ */
    uint8 private constant EMAIL_ADDRESS_LENGTH = 21;   // 21 bytes in an email address

    /* ============ State Variables ============ */
    address public immutable ramp;
    IKeyHashAdapter public venmoMailserverKeyHashAdapter;
    bytes public emailFromAddress;

    /* ============ Constructor ============ */
    constructor(
        address _ramp,
        IKeyHashAdapter _venmoMailserverKeyHashAdapter,
        string memory _emailFromAddress
    )
        Ownable()
    {
        require(bytes(_emailFromAddress).length == EMAIL_ADDRESS_LENGTH, "Email from address not properly padded");

        ramp = _ramp;
        venmoMailserverKeyHashAdapter = _venmoMailserverKeyHashAdapter;
        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Functions ============ */

    function setVenmoMailserverKeyHashAdapter(IKeyHashAdapter _venmoMailserverKeyHashAdapter) external onlyOwner {
        venmoMailserverKeyHashAdapter = _venmoMailserverKeyHashAdapter;
    }

    function setEmailFromAddress(string memory _emailFromAddress) external onlyOwner {
        require(bytes(_emailFromAddress).length == EMAIL_ADDRESS_LENGTH, "Email from address not properly padded");

        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Getters ============ */

    function getEmailFromAddress() external view returns (bytes memory) {
        return emailFromAddress;
    }

    function getVenmoMailserverKeyHash() public view returns (bytes32) {
        return IKeyHashAdapter(venmoMailserverKeyHashAdapter).venmoMailserverKeyHash();
    }
}
