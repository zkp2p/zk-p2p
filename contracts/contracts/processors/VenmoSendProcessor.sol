import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ISendProcessor } from "../interfaces/ISendProcessor.sol";
import { ProofParsingUtils } from "../lib/ProofParsingUtils.sol";
import { VenmoSendVerifier } from "../verifiers/VenmoSendVerifier.sol";

pragma solidity ^0.8.18;

contract VenmoSendProcessor is VenmoSendVerifier, ISendProcessor, Ownable {

    using ProofParsingUtils for string;
    using ProofParsingUtils for uint256[5];

    /* ============ Constants ============ */
    uint16 private constant BYTES_IN_PACKED_BYTES = 7;  // 7 bytes in a packed item returned from circom
    
    /* ============ State Variables ============ */
    bytes32 public venmoMailserverKeyHash;
    bytes public emailFromAddress;

    mapping(bytes32 => bool) public isEmailNullified;

    /* ============ Constructor ============ */
    constructor(
        bytes32 _venmoMailserverKeyHash,
        string memory _emailFromAddress
    )
        VenmoSendVerifier()
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
        ISendProcessor.SendProof calldata _proof
    )
        public
        override
        returns(uint256 amount, bytes32 offRamperIdHash, bytes32 intentHash)
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof"); // checks effects iteractions, this should come first

        require(bytes32(_proof.signals[0]) == venmoMailserverKeyHash, "Invalid mailserver key hash");

        // Signals [1:6] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [6:11] are the packed timestamp, multiply by 1e4 since venmo only gives us two decimals instead of 6
        amount = _parseSignalArray(_proof.signals, 6).stringToUint256() * 1e4;

        // Signals [11] is the packed offRamperIdHsdh
        offRamperIdHash = bytes32(_proof.signals[11]);

        // Check if email has been used previously, if not nullify it so it can't be used again
        bytes32 nullifier = bytes32(_proof.signals[12]);
        require(!isEmailNullified[nullifier], "Email has already been used");
        isEmailNullified[nullifier] = true;

        // Signals [13] is intentHash
        intentHash = bytes32(_proof.signals[13]);
    }

    function getEmailFromAddress() external view returns (bytes memory) {
        return emailFromAddress;
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[14] calldata _signals, uint8 _from) internal pure returns (string memory) {
        uint256[5] memory signalArray;
        for (uint256 i = _from; i < _from + 5; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToBytes(5);
    }
}
