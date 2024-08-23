//SPDX-License-Identifier: MIT

import { IVerifyDomainProcessor } from "./IVerifyDomainProcessor.sol";

pragma solidity ^0.8.18;

interface IVerifiedDomainRegistry {

    struct Domain {
        address owner;
        string name;
        uint256 expiryTime;
    }

    struct DomainWithId {
        bytes32 domainId;
        Domain domain;
    }

    function verifyDomains(IVerifyDomainProcessor.Proof[] memory _proofs) external;
    function getDomainId(string memory _domainName) external pure returns (bytes32);
    function getDomainOwner(bytes32 _domainId) external view returns (address);
}
