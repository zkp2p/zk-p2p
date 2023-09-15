import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IRegistrationProcessor } from "../interfaces/IRegistrationProcessor.sol";
import { ProofParsingUtils } from "../lib/ProofParsingUtils.sol";
import { VenmoRegistrationVerifier } from "../verifiers/VenmoRegistrationVerifier.sol";

pragma solidity ^0.8.18;

contract VenmoRegistrationProcessor is VenmoRegistrationVerifier, IRegistrationProcessor, Ownable {

    using ProofParsingUtils for string;
    using ProofParsingUtils for uint256[5];

    /* ============ State Variables ============ */
    bytes32 public venmoMailserverKeyHash;
    bytes public emailFromAddress;

    /* ============ Constructor ============ */
    constructor(
        bytes32 _venmoMailserverKeyHash,
        string memory _emailFromAddress
    )
        VenmoRegistrationVerifier()
        Ownable()
    {
        require(bytes(_emailFromAddress).length == 35, "Email from address not properly padded");

        venmoMailserverKeyHash = _venmoMailserverKeyHash;
        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Functions ============ */

    function setVenmoMailserverKeyHash(bytes32 _venmoMailserverKeyHash) external onlyOwner {
        venmoMailserverKeyHash = _venmoMailserverKeyHash;
    }

    function setEmailFromAddress(string memory _emailFromAddress) external onlyOwner {
        require(bytes(_emailFromAddress).length == 35, "Email from address not properly padded");

        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External View Functions ============ */
    function processProof(
        IRegistrationProcessor.RegistrationProof calldata _proof
    )
        public
        view
        override
        returns(bytes32 onRamperIdHash)
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(bytes32(_proof.signals[0]) == venmoMailserverKeyHash, "Invalid mailserver key hash");

        // Signals [1:6] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [6] is the packed onRamperIdHash
        onRamperIdHash = bytes32(_proof.signals[6]);
    }

    function getEmailFromAddress() external view returns (bytes memory) {
        return emailFromAddress;
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[7] calldata _signals, uint8 _from) internal pure returns (string memory) {
        uint256[5] memory signalArray;
        for (uint256 i = _from; i < _from + 5; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToBytes(5);
    }
}
