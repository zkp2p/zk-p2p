//SPDX-License-Identifier: MIT

import { Claims } from "@reclaimprotocol/verifier-solidity-sdk/contracts/Claims.sol";

pragma solidity ^0.8.18;

library ClaimVerifier {

    /**
     * Find the end index of target string in the data string. Returns the end index + 1 if
     * the target string in the data string if found. Returns type(uint256).max if:
     * - Target is longer than data
     * - Target is not found
     * Parts of the code are adapted from: https://basescan.org/address/0x7281630e4346dd4c0b7ae3b4689c1d0102741410#code
     */
    function findSubstringEndIndex(
        string memory data,
        string memory target
    ) public pure returns (uint256) {
        bytes memory dataBytes = bytes(data);
        bytes memory targetBytes = bytes(target);

        if (dataBytes.length < targetBytes.length) {
            return type(uint256).max;
        }

        // Find start of target
        for (uint i = 0; i <= dataBytes.length - targetBytes.length; i++) {
            bool isMatch = true;

            for (uint j = 0; j < targetBytes.length && isMatch; j++) {
                if (dataBytes[i + j] != targetBytes[j]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return i + targetBytes.length; // Return end index + 1
            }
        }

        return type(uint256).max;
    }

    /**
     * Extracts given target field value from context in claims. Extracts only ONE value.
     * Pass prefix formatted with quotes, for example '"providerHash\":\"'
     * Parts of the code are adapted from: https://basescan.org/address/0x7281630e4346dd4c0b7ae3b4689c1d0102741410#code
     *
     * @param data      Context string from which target value needs to be extracted
     * @param prefix    Prefix of the target value that needs to be extracted            
     */
    function extractFieldFromContext(
        string memory data,
        string memory prefix
    ) public pure returns (string memory) {
        // Find end index of prefix; which is the start index of the value
        uint256 start = findSubstringEndIndex(data, prefix);

        bytes memory dataBytes = bytes(data);
        if (start == dataBytes.length) {
            return ""; // Prefix not found. Malformed or missing message
        }
        
        // Find the end of the VALUE, assuming it ends with a quote not preceded by a backslash
        uint256 end = start;
        while (
            end < dataBytes.length &&
            !(dataBytes[end] == '"' && dataBytes[end - 1] != "\\")
        ) {
            end++;
        }
        if (end <= start) {
            return ""; // Malformed or missing message
        }
        bytes memory contextMessage = new bytes(end - start);
        for (uint i = start; i < end; i++) {
            contextMessage[i - start] = dataBytes[i];
        }
        return string(contextMessage);
    }


    /**
     * Extracts ALL values from context in a single pass. Context is stored as serialized JSON string with 
     * two keys: extractedParameters and providerHash. ExtractedParameters itself is a JSON string with 
     * key-value pairs. This function returns extracted individual values from extractedParameters along 
     * with providerHash (if extractProviderHash is true). Use maxValues to limit the number of expected values
     * to be extracted from extractedParameters. In most cases, one would need to extract all values from
     * extractedParameters and providerHash, hence use this function over calling extractFieldFromContext 
     * multiple times.
     * 
     * @param data                  Context string from which target value needs to be extracted
     * @param maxValues             Maximum number of values to be extracted from extractedParameters
     * @param extractProviderHash   Extracts and returns providerHash if true
     */
    function extractAllFromContext(
        string memory data,
        uint8 maxValues,
        bool extractProviderHash
    ) public pure returns (string[] memory) {
        
        require(maxValues > 0, "Max values must be greater than 0");

        bytes memory dataBytes = bytes(data);
        uint index = 0;

        bytes memory extractedParametersBytes = bytes('{\"extractedParameters\":{\"');
        for (uint i = 0; i < extractedParametersBytes.length; i++) {
            require(dataBytes[index + i] == extractedParametersBytes[i], "Extraction failed. Malformed extractedParameters");
        }
        index += extractedParametersBytes.length;

        bool isValue = false;       // starts with a key right after '{\"extractedParameters\":{\"'
        uint valuesFound = 0;
    
        uint[] memory valueIndices = new uint[](extractProviderHash ? 2 * (maxValues + 1): 2 * maxValues);

        while (
            index < dataBytes.length
        ) {
            // Keep incrementing until '"', escaped quotes are not considered
            if (!(dataBytes[index] == '"' && dataBytes[index - 1] != "\\")) {
                index++;
                continue;
            }

            if (!isValue) {
                // \":\" (3 chars)
                require(dataBytes[index + 1] == ":" && dataBytes[index + 2] == '\"', "Extraction failed. Malformed data 1");
                index += 3;     // move it after \"
                isValue = true;
                valueIndices[2 * valuesFound] = index;      // start index
            } else {
                // \",\" (3 chars) or \"}, (3 chars)
                // \"}} is not supported, there should always be a providerHash
                require(
                    dataBytes[index + 1] == "," && dataBytes[index + 2] == '\"' ||  
                    dataBytes[index + 1] == '}' && dataBytes[index + 2] == ",",
                    "Extraction failed. Malformed data 2"
                );
                valueIndices[2 * valuesFound + 1] = index;      // end index
                valuesFound++;

                if (dataBytes[index + 1] == ",") {
                    // Revert if valuesFound == maxValues and next char is a comma as there will be more values
                    require(valuesFound != maxValues, "Extraction failed. Exceeded max values");
                    index += 3;
                    isValue = false;
                } else {    // index + 1 = "}"
                    index += 3;
                    break;  // end of extractedParameters
                }
            }
        }

        if (extractProviderHash) {
            bytes memory providerHashParamBytes = bytes("\"providerHash\":\"");
            for (uint i = 0; i < providerHashParamBytes.length; i++) {
                require(dataBytes[index + i] == providerHashParamBytes[i], "Extraction failed. Malformed providerHash");
            }
            index += providerHashParamBytes.length;
            
            // final indices tuple in valueIndices will be for start and end indices of provider hash
            valueIndices[2 * valuesFound] = index;
            // Keep incrementing until '"'
            while (
                index < dataBytes.length && dataBytes[index] != '"'
            ) {
                index++;
            }
            valueIndices[2 * valuesFound + 1] = index;
            valuesFound++;
        }   
        
        string[] memory values = new string[](valuesFound);
        
        for (uint i = 0; i < valuesFound; i++) {
            uint startIndex = valueIndices[2 * i];
            uint endIndex = valueIndices[2 * i + 1];
            bytes memory contextValue = new bytes(endIndex - startIndex);
            for (uint j = startIndex; j < endIndex; j++) {
                contextValue[j - startIndex] = dataBytes[j];
            }
            values[i] = string(contextValue);
        }

        return values;
    }
}
