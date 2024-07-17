//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Claims } from "@reclaimprotocol/verifier-solidity-sdk/contracts/Claims.sol";
import { StringUtils } from "@reclaimprotocol/verifier-solidity-sdk/contracts/StringUtils.sol";

import { IClaimVerifier } from "../../interfaces/IClaimVerifier.sol";
import { AddressArrayUtils } from "../../external/AddressArrayUtils.sol";

pragma solidity ^0.8.18;

contract ClaimVerifier is Ownable, IClaimVerifier {

    using AddressArrayUtils for address[];

    /* ============ Events ============ */
    event WitnessAdded(address witness);
    event WitnessRemoved(address witness);
    event ProviderHashAdded(string providerHash);
    event ProviderHashRemoved(string providerHash);
    
    /* ============ State Variables ============ */
    mapping(address => bool) public isWitness;
    address[] public witnesses;
    mapping(string => bool) public isProviderHash;
    string[] public providerHashes;                         // Set of provider hashes that these proofs should be for

    /* ============ Constructor ============ */
    constructor() Ownable() {}

    /* ============ Admin Functions ============ */

    /**
     * ONLY OWNER: Add witness address. Witness must not have been previously added.
     *
     * @param _newWitness    Address of the new witness
     */
    function addWitness(address _newWitness) external onlyOwner {
        require(!isWitness[_newWitness], "Address is already a witness");

        isWitness[_newWitness] = true;
        witnesses.push(_newWitness);

        emit WitnessAdded(_newWitness);
    }

    /**
     * ONLY OWNER: Remove witness address. Witness must have been previously added.
     *
     * @param _removeWitness    Address of witness to be removed
     */
    function removeWitness(address _removeWitness) external onlyOwner {
        require(isWitness[_removeWitness], "Address is not a witness");

        isWitness[_removeWitness] = false;
        witnesses.removeStorage(_removeWitness);

        emit WitnessRemoved(_removeWitness);
    }

    /**
     * ONLY OWNER: Add provider hash string. Provider hash must not have been previously added.
     *
     * @param _newProviderHash    New provider hash to be added
     */
    function addProviderHash(string memory _newProviderHash) external onlyOwner {
        require(!isProviderHash[_newProviderHash], "Provider hash already added");

        isProviderHash[_newProviderHash] = true;
        providerHashes.push(_newProviderHash);

        emit ProviderHashAdded(_newProviderHash);
    }

    /**
     * ONLY OWNER: Remove provider hash string. Provider hash must have been previously added.
     *
     * @param _removeProviderHash    Provider hash to be removed
     */
    function removeProviderHash(string memory _removeProviderHash) external onlyOwner {
        require(isProviderHash[_removeProviderHash], "Address is not a witness");

        // @TODO: Replace this with StringArrayUtils if we have such a library.

        isProviderHash[_removeProviderHash] = false;
        for (uint256 i = 0; i < providerHashes.length; i++) {
            if (keccak256(abi.encodePacked(providerHashes[i])) == keccak256(abi.encodePacked(_removeProviderHash))) {
                providerHashes[i] = providerHashes[providerHashes.length - 1];
                providerHashes.pop();
                break;
            }
        }

        emit ProviderHashRemoved(_removeProviderHash);
    }

    /* ============ Public Functions ============ */

    /**
     * Checks if the provided provider hash is valid by comparing it against the array of provider hashes.
     *
     * @param _providerHash     The provider hash to validate
     * @return bool             True if the provider hash is found in the array of valid hashes, false otherwise
     */
    function isValidProviderHash(string memory _providerHash) public view returns (bool) {
        for (uint256 i = 0; i < providerHashes.length; i++) {
            if (StringUtils.areEqual(_providerHash, providerHashes[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extracts values from context in claims. 
     * Source: https://basescan.org/address/0x7281630e4346dd4c0b7ae3b4689c1d0102741410#code
     *
     * @param data      Context string from which target value needs to be extracted
     * @param target    Key of the target value that needs to be extracted            
     */
    function extractFieldFromContext(
        string memory data,
        string memory target
    ) public pure returns (string memory) {
        // Find the end of the message, assuming it ends with a quote not preceded by a backslash
        uint256 end = findSubstringIndex(data, target);
        bytes memory dataBytes = bytes(data);
        if (end == dataBytes.length) {
            return ""; // Malformed or missing message
        }
        
        uint256 start = end;
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
    
    function findSubstringIndex(
        string memory data,
        string memory target
    ) public pure returns (uint256) {
        bytes memory dataBytes = bytes(data);
        bytes memory targetBytes = bytes(target);

        require(dataBytes.length >= targetBytes.length, "target is longer than data");

        // Find start of "contextMessage":"
        for (uint i = 0; i <= dataBytes.length - targetBytes.length; i++) {
            bool isMatch = true;

            for (uint j = 0; j < targetBytes.length && isMatch; j++) {
                if (dataBytes[i + j] != targetBytes[j]) {
                    isMatch = false;
                }
            }

            if (isMatch) {
                return i + targetBytes.length; // Move start to the end of "contextMessage":"
            }
        }

        return dataBytes.length;
    }

    /**
     * Extract all values in context in a single pass.
     */
    function extractAllFromContext(
        string memory data,
        uint8 maxValues,
        bool extractProviderHash
    ) public pure returns (string[] memory) {
        
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
                require(dataBytes[index + 1] == ":" && dataBytes[index + 2] == '\"', "Extraction failed. Malformed data");
                index += 3;     // move it after \"
                isValue = true;
                valueIndices[2 * valuesFound] = index;      // start index
            } else {
                // \",\" (3 chars) or \"}, (3 chars)
                // \"}} is not supported, there should always be a providerHash
                require(
                    dataBytes[index + 1] == "," && dataBytes[index + 2] == '\"' ||  
                    dataBytes[index + 1] == '}' && dataBytes[index + 2] == ",",
                    "Extraction failed. Malformed data"
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
                    break;  // end of extractedParameteres
                }
            }
        }

        if (extractProviderHash) {
            bytes memory providerHashParamBytes = bytes("\"providerHash\":\"");
            for (uint i = 0; i < providerHashParamBytes.length; i++) {
                require(dataBytes[index + i] == providerHashParamBytes[i], "Extraction failed. Malformed providerHash");
            }
            index += providerHashParamBytes.length;
            
            // final indices tuple in valueIndices will be for star and end indices of provider hash
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

    /**
     * Verify claim (proof) signed by one or more witnesses.
     * Source: https://basescan.org/address/0x7281630e4346dd4c0b7ae3b4689c1d0102741410#code
     *    
     * @param proof                 Proof to be verified
     */
    function verifyClaim(
        Proof memory proof,
        bool validateProviderHash
    ) public view returns (bool) {
        
        // create signed claim using claimData and signature.
        require(proof.signedClaim.signatures.length > 0, "No signatures");
        Claims.SignedClaim memory signed = Claims.SignedClaim(
            proof.signedClaim.claim,
            proof.signedClaim.signatures
        );

        // check if the hash from the claimInfo is equal to the infoHash in the claimData
        bytes32 hashed = Claims.hashClaimInfo(proof.claimInfo);
        require(proof.signedClaim.claim.identifier == hashed, "ClaimInfo hash doesn't match");

        address[] memory signedWitnesses = Claims.recoverSignersOfSignedClaim(signed);

        // check if the number of signatures is equal to the number of witnesses
        require(
            signedWitnesses.length == witnesses.length,
            "Number of signatures not equal to number of witnesses"
        );

        // Check signatures are from witnesses
        for (uint256 i = 0; i < signed.signatures.length; i++) {
            bool found = false;
            for (uint j = 0; j < witnesses.length; j++) {
                if (signedWitnesses[i] == witnesses[j]) {
                    found = true;
                    break;
                }
            }
            require(found, "Signature not appropriate");
        }

        // Extract and verify provider hashes
        if (validateProviderHash) {
            string memory proofProviderHash = extractFieldFromContext(
                proof.claimInfo.context,
                '"providerHash\":\"'
            );
            require(isValidProviderHash(proofProviderHash), "No valid providerHash");
        }

        return true;
    }

    /* ============ View Functions ============ */

    function getWitnesses() external view returns (address[] memory) {
        return witnesses;
    }

    function getProviderHashes() external view returns (string[] memory) {
        return providerHashes;
    }

}
