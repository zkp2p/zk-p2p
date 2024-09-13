// SPDX-License-Identifier: MIT

import { ITransferDomainProcessor } from "../interfaces/ITransferDomainProcessor.sol";
import { StringUtils } from "@zk-email/contracts/utils/StringUtils.sol";


pragma solidity ^0.8.18;

contract TransferDomainProcessorMock is ITransferDomainProcessor {

    using StringUtils for uint256;

    /* ============ State Variables ============ */
    string storedDomainName;

    /* ============ Constructor ============ */
    constructor() {}

    /* ============ External Functions ============ */

    function setDomainName(string memory _domainName) external {
        storedDomainName = _domainName;
    }

    function processProof(TransferProof memory _proof)
        external
        view
        override
        returns (bytes32 dkimKeyHash, bytes32 hashedReceiverId, string memory domainName, uint256 bidId)
    {
        dkimKeyHash = bytes32(_proof.signals[0]);
        hashedReceiverId = bytes32(_proof.signals[1]);
        domainName = storedDomainName;
        bidId = _proof.signals[3];
    }
}


