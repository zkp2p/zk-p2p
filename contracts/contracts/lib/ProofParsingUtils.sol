//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

library ProofParsingUtils {

    /* ============ Constants ============ */
    uint16 private constant BYTES_IN_PACKED_BYTES = 7;  // 7 bytes in a packed item returned from circom

    // Unpacks uint256s into bytes and then extracts the non-zero characters
    // Only extracts contiguous non-zero characters and ensures theres only 1 such state
    // Note that unpackedLen may be more than packedBytes.length * 8 since there may be 0s
    // TODO: Remove console.logs and define this as a pure function instead of a view
    function convertPackedBytesToBytes(uint256[] memory packedBytes, uint256 signals) internal pure returns (string memory extractedString) {
        // Calculate max bytes as the amount of signals * 7 bytes per signal
        uint256 maxBytes = signals * BYTES_IN_PACKED_BYTES;
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
    function stringToUint256(string memory s) internal pure returns (uint256) {
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
