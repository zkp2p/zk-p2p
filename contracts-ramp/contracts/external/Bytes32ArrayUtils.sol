//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

/**
 * @title Bytes32ArrayUtils
 * @author ZKP2P
 *
 * Fork of Set Protocol's AddressArrayUtils library adapted for usage with bytes32 arrays.
 */
library Bytes32ArrayUtils {

    uint256 constant internal MAX_INT = 2**256 - 1;

    /**
     * Finds the index of the first occurrence of the given element.
     * @param A The input array to search
     * @param a The value to find
     * @return Returns (index and isIn) for the first occurrence starting from index 0
     */
    function indexOf(bytes32[] memory A, bytes32 a) internal pure returns (uint256, bool) {
        uint256 length = A.length;
        for (uint256 i = 0; i < length; i++) {
            if (A[i] == a) {
                return (i, true);
            }
        }
        return (MAX_INT, false);
    }

    /**
    * Returns true if the value is present in the list. Uses indexOf internally.
    * @param A The input array to search
    * @param a The value to find
    * @return Returns isIn for the first occurrence starting from index 0
    */
    function contains(bytes32[] memory A, bytes32 a) internal pure returns (bool) {
        (, bool isIn) = indexOf(A, a);
        return isIn;
    }

    /**
    * Returns true if there are 2 elements that are the same in an array
    * @param A The input array to search
    * @return Returns boolean for the first occurrence of a duplicate
    */
    function hasDuplicate(bytes32[] memory A) internal pure returns(bool) {
        require(A.length > 0, "A is empty");

        for (uint256 i = 0; i < A.length - 1; i++) {
            bytes32 current = A[i];
            for (uint256 j = i + 1; j < A.length; j++) {
                if (current == A[j]) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param A The input array to search
     * @param a The bytes32 to remove
     * @return Returns the array with the object removed.
     */
    function remove(bytes32[] memory A, bytes32 a)
        internal
        pure
        returns (bytes32[] memory)
    {
        (uint256 index, bool isIn) = indexOf(A, a);
        if (!isIn) {
            revert("bytes32 not in array.");
        } else {
            (bytes32[] memory _A,) = pop(A, index);
            return _A;
        }
    }

    /**
     * @param A The input array to search
     * @param a The bytes32 to remove
     */
    function removeStorage(bytes32[] storage A, bytes32 a)
        internal
    {
        (uint256 index, bool isIn) = indexOf(A, a);
        if (!isIn) {
            revert("bytes32 not in array.");
        } else {
            uint256 lastIndex = A.length - 1; // If the array would be empty, the previous line would throw, so no underflow here
            if (index != lastIndex) { A[index] = A[lastIndex]; }
            A.pop();
        }
    }

    /**
    * Removes specified index from array
    * @param A The input array to search
    * @param index The index to remove
    * @return Returns the new array and the removed entry
    */
    function pop(bytes32[] memory A, uint256 index)
        internal
        pure
        returns (bytes32[] memory, bytes32)
    {
        uint256 length = A.length;
        require(index < A.length, "Index must be < A length");
        bytes32[] memory newBytes = new bytes32[](length - 1);
        for (uint256 i = 0; i < index; i++) {
            newBytes[i] = A[i];
        }
        for (uint256 j = index + 1; j < length; j++) {
            newBytes[j - 1] = A[j];
        }
        return (newBytes, A[index]);
    }
}
