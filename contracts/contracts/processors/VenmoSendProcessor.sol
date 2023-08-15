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
    uint256[17] public venmoMailserverKeys;
    bytes public emailFromAddress;

    /* ============ Constructor ============ */
    constructor(
        uint256[17] memory _venmoMailserverKeys,
        string memory _emailFromAddress
    )
        VenmoSendVerifier()
        Ownable()
    {
        require(bytes(_emailFromAddress).length == 35, "Email from address not properly padded");

        venmoMailserverKeys = _venmoMailserverKeys;
        emailFromAddress = bytes(_emailFromAddress);
    }

    /* ============ External Functions ============ */

    function setVenmoMailserverKeys(uint256[17] memory _venmoMailserverKeys) external onlyOwner {
        venmoMailserverKeys = _venmoMailserverKeys;
    }

    // Set emailFromAddress
    
    /* ============ External View Functions ============ */
    function processProof(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[51] memory _signals
    )
        public
        view
        override
        returns(uint256 amount, uint256 offRamperId, bytes32 offRamperIdHash, bytes32 intentHash)
    {
        require(verifyProof(_a, _b, _c, _signals), "Invalid Proof"); // checks effects iteractions, this should come first

        // Signals [0:5] are the packed from email address
        string memory fromEmail = _parseSignalArray(_signals, 0);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [5:10] are the packed timestamp, multiply by 1e4 since venmo only gives us two decimals instead of 6
        amount = _parseSignalArray(_signals, 5).stringToUint256() * 1e4;

        // Signals [10:15] is the packed offRamperId
        offRamperId = _parseSignalArray(_signals, 10).stringToUint256();

        // Signals [15] is the packed offRamperIdHsdh
        offRamperIdHash = bytes32(_signals[15]);

        // Signals [16:33] are modulus.
        for (uint256 i = 16; i < 33; i++) {
            require(_signals[i] == venmoMailserverKeys[i - 16], "Invalid: RSA modulus not matched");
        }

        // Signals [50] is intentHash
        intentHash = bytes32(_signals[50]);
    }

    function getVenmoMailserverKeys() external view returns (uint256[17] memory) {
        return venmoMailserverKeys;
    }

    function getEmailFromAddress() external view returns (bytes memory) {
        return emailFromAddress;
    }

    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[51] memory _signals, uint8 _from) internal pure returns (string memory) {
        uint256[5] memory signalArray;
        for (uint256 i = _from; i < _from + 5; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToBytes(5);
    }
}
