//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IRegistrationProcessor } from "../interfaces/IRegistrationProcessor.sol";
import { ProofParsingUtils } from "../lib/ProofParsingUtils.sol";
import { Groth16Verifier } from "../verifiers/venmo_registration_verifier.sol";

pragma solidity ^0.8.18;

contract VenmoRegistrationProcessor is Groth16Verifier, IRegistrationProcessor, Ownable {

    using ProofParsingUtils for string;
    using ProofParsingUtils for uint256[];

    /* ============ Constants ============ */
    uint8 private constant EMAIL_ADDRESS_LENGTH = 21;   // 21 bytes in an email address

    /* ============ State Variables ============ */
    bytes32 public venmoMailserverKeyHash;
    bytes public emailFromAddress;

    /* ============ Constructor ============ */
    constructor(
        bytes32 _venmoMailserverKeyHash,
        string memory _emailFromAddress
    )
        Groth16Verifier()
        Ownable()
    {
        require(bytes(_emailFromAddress).length == EMAIL_ADDRESS_LENGTH, "Email from address not properly padded");

        venmoMailserverKeyHash = _venmoMailserverKeyHash;
        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Functions ============ */

    function setVenmoMailserverKeyHash(bytes32 _venmoMailserverKeyHash) external onlyOwner {
        venmoMailserverKeyHash = _venmoMailserverKeyHash;
    }

    function setEmailFromAddress(string memory _emailFromAddress) external onlyOwner {
        require(bytes(_emailFromAddress).length == EMAIL_ADDRESS_LENGTH, "Email from address not properly padded");

        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External View Functions ============ */
    function processProof(
        IRegistrationProcessor.RegistrationProof calldata _proof
    )
        public
        view
        override
        returns(bytes32 userIdHash)
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(bytes32(_proof.signals[0]) == venmoMailserverKeyHash, "Invalid mailserver key hash");

        // Signals [1:4] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1, 4);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [4] is the packed onRamperIdHash
        userIdHash = bytes32(_proof.signals[4]);
    }

    function getEmailFromAddress() external view returns (bytes memory) {
        return emailFromAddress;
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[5] calldata _signals, uint8 _from, uint8 _to) internal pure returns (string memory) {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToBytes(_to - _from);
    }
}
