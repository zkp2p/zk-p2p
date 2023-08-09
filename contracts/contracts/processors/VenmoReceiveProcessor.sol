import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IReceiveProcessor } from "../interfaces/IReceiveProcessor.sol";
import { VenmoReceiveVerifier } from "../verifiers/VenmoReceiveVerifier.sol";

pragma solidity ^0.8.18;

contract VenmoReceiveProcessor is VenmoReceiveVerifier, IReceiveProcessor, Ownable {

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
        VenmoReceiveVerifier()
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
        returns(uint256 timestamp, uint256 onRamperId, bytes32 onRamperIdHash, bytes32 intentHash)
    {
        require(verifyProof(_a, _b, _c, _signals), "Invalid Proof"); // checks effects iteractions, this should come first

        // Signals [0:5] are the packed from email address
        string memory fromEmail = _parseSignalArray(_signals, 0);
        require(keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), "Invalid email from address");

        // Signals [5:10] are the packed timestamp
        timestamp = _stringToUint256(_parseSignalArray(_signals, 5));

        // Signals [10:15] is the packed onRamperId
        onRamperId = _stringToUint256(_parseSignalArray(_signals, 10));

        // Signals [15] is the packed onRamperIdHsdh
        onRamperIdHash = bytes32(_signals[15]);

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

        return _convertPackedBytesToBytes(signalArray, BYTES_IN_PACKED_BYTES * 5);
    }

    // Unpacks uint256s into bytes and then extracts the non-zero characters
    // Only extracts contiguous non-zero characters and ensures theres only 1 such state
    // Note that unpackedLen may be more than packedBytes.length * 8 since there may be 0s
    // TODO: Remove console.logs and define this as a pure function instead of a view
    function _convertPackedBytesToBytes(uint256[5] memory packedBytes, uint256 maxBytes) public pure returns (string memory extractedString) {
        uint8 state = 0;
        // bytes: 0 0 0 0 y u s h _ g 0 0 0
        // state: 0 0 0 0 1 1 1 1 1 1 2 2 2
        bytes memory nonzeroBytesArray = new bytes(packedBytes.length * 7);
        uint256 nonzeroBytesArrayIndex = 0;
        for (uint16 i = 0; i < packedBytes.length; i++) {
            uint256 packedByte = packedBytes[i];
            uint8[] memory unpackedBytes = new uint8[](BYTES_IN_PACKED_BYTES);
            for (uint j = 0; j < BYTES_IN_PACKED_BYTES; j++) {
                unpackedBytes[j] = uint8(packedByte >> (j * 8));
            }

            for (uint256 j = 0; j < BYTES_IN_PACKED_BYTES; j++) {
                uint256 unpackedByte = unpackedBytes[j]; //unpackedBytes[j];
                if (unpackedByte != 0) {
                    nonzeroBytesArray[nonzeroBytesArrayIndex] = bytes1(uint8(unpackedByte));
                    nonzeroBytesArrayIndex++;
                    if (state % 2 == 0) {
                        state += 1;
                    }
                } else {
                    if (state % 2 == 1) {
                        state += 1;
                    }
                }
                packedByte = packedByte >> 8;
            }
        }

        extractedString = string(nonzeroBytesArray);
        require(state == 2, "Invalid final state of packed bytes in email");
        // console.log("Characters in username: ", nonzeroBytesArrayIndex);
        require(nonzeroBytesArrayIndex <= maxBytes, "Venmo id too long");
        // Have to end at the end of the email -- state cannot be 1 since there should be an email footer
    }

    // // Code example:
    function _stringToUint256(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        uint256 oldResult = 0;

        for (uint i = 0; i < b.length; i++) { // c = b[i] was not needed
            // UNSAFE: Check that the character is a number - we include padding 0s in Venmo ids
            if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
                // store old value so we can check for overflows
                oldResult = result;
                result = result * 10 + (uint8(b[i]) - 48);
                // prevent overflows
                require(result >= oldResult, "Overflow detected");
            }
        }
        return result; 
    }
}
