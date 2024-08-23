//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


interface ITransferDomainProcessor {

    struct TransferProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[10] signals;
    }

    function processProof(
        TransferProof calldata _proof
    ) 
        external 
        returns (bytes32 hashedReceiverId, string memory domainName, uint256 bidId);
}