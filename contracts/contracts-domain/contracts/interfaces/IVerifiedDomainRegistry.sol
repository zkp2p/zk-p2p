//SPDX-License-Identifier: MIT

import { IVerifyDomainProcessor } from "./IVerifyDomainProcessor.sol";

pragma solidity ^0.8.18;

interface IVerifiedDomainRegistry {

    struct Domain {
        address owner;
        string name;
        uint256 expiryTime;
        address exchange;
        uint256 listingId;
    }

    struct DomainWithId {
        bytes32 domainId;
        Domain domain;
    }

    function verifyDomains(IVerifyDomainProcessor.Proof[] memory _proofs) external;
    
    function getDomainId(string memory _domainName) external pure returns (bytes32);
    function getDomainOwner(bytes32 _domainId) external view returns (address);
    function getDomain(bytes32 _domainId) external view returns (DomainWithId memory);
    function getDomains(bytes32[] memory _domainId) external view returns (DomainWithId[] memory);
    
    function setDomainListing(bytes32 _domainId, uint256 _listingId) external;
    function removeDomainListing(bytes32 _domainId) external;
    function updateDomainOnSale(bytes32 _domainId, address _newOwner) external;
}
