import { IReceiveProcessor } from "../interfaces/IReceiveProcessor.sol";
import { VenmoReceiveVerifier } from "../verifiers/VenmoReceiveVerifier.sol";

pragma solidity ^0.8.18;

contract VenmoReceiveProcessor is VenmoReceiveVerifier, IReceiveProcessor {

    /* ============ Constructor ============ */
    constructor() VenmoReceiveVerifier() {}

    /* ============ External View Functions ============ */
    function processProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[32] memory signals
    )
        public
        view
        override
        returns(uint256 timestamp, uint256 onRamperId, bytes32 onRamperIdHash, bytes32 intentHash)
    {
        require(verifyProof(a, b, c, signals), "Invalid Proof"); // checks effects iteractions, this should come first

        // // Signals [0] is offRamper Venmo ID
        // offRamperVenmoId = signals[0];

        // // Signals [1:3] are packed amount value
        // uint256[3] memory amountSignals;
        // for (uint256 i = 1; i < 4; i++) {
        //     amountSignals[i - 1] = signals[i];
        // }
        // uint256 amount = _stringToUint256(_convertPackedBytesToBytes(amountSignals, bytesInPackedBytes * 3));
        // usdAmount = amount * 10 ** 6;

        // // Signals [4, 5, 6] are nullifier
        // bytes memory nullifierAsBytes = abi.encodePacked(
        //     signals[4], signals[5], signals[6]
        // );
        // nullifier = keccak256(nullifierAsBytes);
        // require(!nullified[nullifier], "Email has already been used");

        // // Signals [7, 8, ...., 23] are modulus.
        // for (uint256 i = 7; i < msgLen - 2; i++) {
        //     require(signals[i] == venmoMailserverKeys[i - 7], "Invalid: RSA modulus not matched");
        // }

        // // Signals [24] is orderId
        // orderId = signals[msgLen - 2];

        // // Signals [25] is claimId
        // claimId = signals[msgLen - 1];
    }

    /* ============ Internal Functions ============ */

    // Unpacks uint256s into bytes and then extracts the non-zero characters
    // Only extracts contiguous non-zero characters and ensures theres only 1 such state
    // Note that unpackedLen may be more than packedBytes.length * 8 since there may be 0s
    // TODO: Remove console.logs and define this as a pure function instead of a view
    // function _convertPackedBytesToBytes(uint256[3] memory packedBytes, uint256 maxBytes) public pure returns (string memory extractedString) {
    //     uint8 state = 0;
    //     // bytes: 0 0 0 0 y u s h _ g 0 0 0
    //     // state: 0 0 0 0 1 1 1 1 1 1 2 2 2
    //     bytes memory nonzeroBytesArray = new bytes(packedBytes.length * 7);
    //     uint256 nonzeroBytesArrayIndex = 0;
    //     for (uint16 i = 0; i < packedBytes.length; i++) {
    //         uint256 packedByte = packedBytes[i];
    //         uint8[] memory unpackedBytes = new uint8[](bytesInPackedBytes);
    //         for (uint j = 0; j < bytesInPackedBytes; j++) {
    //             unpackedBytes[j] = uint8(packedByte >> (j * 8));
    //         }

    //         for (uint256 j = 0; j < bytesInPackedBytes; j++) {
    //             uint256 unpackedByte = unpackedBytes[j]; //unpackedBytes[j];
    //             if (unpackedByte != 0) {
    //                 nonzeroBytesArray[nonzeroBytesArrayIndex] = bytes1(uint8(unpackedByte));
    //                 nonzeroBytesArrayIndex++;
    //                 if (state % 2 == 0) {
    //                     state += 1;
    //                 }
    //             } else {
    //                 if (state % 2 == 1) {
    //                     state += 1;
    //                 }
    //             }
    //             packedByte = packedByte >> 8;
    //         }
    //     }

    //     string memory returnValue = string(nonzeroBytesArray);
    //     require(state == 2, "Invalid final state of packed bytes in email");
    //     // console.log("Characters in username: ", nonzeroBytesArrayIndex);
    //     require(nonzeroBytesArrayIndex <= maxBytes, "Venmo id too long");
    //     return returnValue;
    //     // Have to end at the end of the email -- state cannot be 1 since there should be an email footer
    // }

    // // Code example:
    // function _stringToUint256(string memory s) internal pure returns (uint256) {
    //     bytes memory b = bytes(s);
    //     uint256 result = 0;
    //     uint256 oldResult = 0;

    //     for (uint i = 0; i < b.length; i++) { // c = b[i] was not needed
    //         // UNSAFE: Check that the character is a number - we include padding 0s in Venmo ids
    //         if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
    //             // store old value so we can check for overflows
    //             oldResult = result;
    //             result = result * 10 + (uint8(b[i]) - 48);
    //             // prevent overflows
    //             require(result >= oldResult, "Overflow detected");
    //         }
    //     }
    //     return result; 
    // }
}
