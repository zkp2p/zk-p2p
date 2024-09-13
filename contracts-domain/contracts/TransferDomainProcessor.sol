// SPDX-License-Identifier: MIT

import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";

import { EmailBaseProcessor } from "./external/processors/EmailBaseProcessor.sol";
import { INullifierRegistry } from "./external/interfaces/INullifierRegistry.sol";
import { StringConversionUtils } from "./external/lib/StringConversionUtils.sol";

import { Groth16Verifier } from "./verifiers/namecheap_transfer_verifier.sol";
import { ITransferDomainProcessor } from "./interfaces/ITransferDomainProcessor.sol";

pragma solidity ^0.8.18;

contract TransferDomainProcessor is Groth16Verifier, ITransferDomainProcessor, EmailBaseProcessor {
    
    using StringUtils for uint256[];
    using StringConversionUtils for string;

    /* ============ Constants ============ */
    uint256 constant PACK_SIZE = 31;

    /* ============ Constructor ============ */
    constructor(
        address _exchange,
        INullifierRegistry _nullifierRegistry,
        string memory _emailFromAddress,
        uint256 _timestampBuffer
    )
        Groth16Verifier()
        EmailBaseProcessor(
            _exchange,
            _nullifierRegistry,
            _emailFromAddress,
            _timestampBuffer
        )
    {}
    
    /* ============ External Functions ============ */

    function processProof(
        TransferProof calldata _proof
    )
        external
        override
        onlyExchange
        returns (
            bytes32 dkimKeyHash,
            bytes32 hashedReceiverId,
            string memory domainName, 
            uint256 bidId
        )
    {
        require(this.verifyProof(_proof.a, _proof.b, _proof.c, _proof.signals), "Invalid Proof");

        // Signal [0] is the DKIM key hash
        dkimKeyHash = bytes32(_proof.signals[0]);

        // Signals [1:2] are the packed from email address
        string memory fromEmail = _parseSignalArray(_proof.signals, 1, 2);
        require(
            keccak256(abi.encodePacked(fromEmail)) == keccak256(emailFromAddress), 
            "Invalid email from address"
        );
        
        // Signals [2:7] are packed domain name
        domainName = _parseSignalArray(_proof.signals, 2, 7);

        // Signal [7] is packed hashed namecheap id to which domain was transferred
        hashedReceiverId = bytes32(_proof.signals[7]);

        // Check if email has been used previously, if not nullify it so it can't be used again
        _validateAndAddNullifier(bytes32(_proof.signals[8]));

        // Signal [9] is bidId
        bidId = _proof.signals[9];
    }
    
    /* ============ Internal Functions ============ */

    function _parseSignalArray(uint256[10] calldata _signals, uint8 _from, uint8 _to) 
        internal 
        pure 
        returns (string memory) 
    {
        uint256[] memory signalArray = new uint256[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            signalArray[i - _from] = _signals[i];
        }

        return signalArray.convertPackedBytesToString(signalArray.length * PACK_SIZE, PACK_SIZE);
    }
}
