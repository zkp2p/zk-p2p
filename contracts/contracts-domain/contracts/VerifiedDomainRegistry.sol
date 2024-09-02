//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Bytes32ArrayUtils } from "./external/lib/Bytes32ArrayUtils.sol";

import { IVerifiedDomainRegistry } from "./interfaces/IVerifiedDomainRegistry.sol";
import { IVerifyDomainProcessor } from "./interfaces/IVerifyDomainProcessor.sol";


pragma solidity ^0.8.18;

contract VerifiedDomainRegistry is IVerifiedDomainRegistry, Ownable {

    using Bytes32ArrayUtils for bytes32[];

    /* ============ Events ============ */
    event DomainVerified(
        bytes32 indexed domainId,
        address indexed owner,
        string domainName,
        uint256 expiryTime
    );

    event VerifyDomainProcessorUpdated(
        IVerifyDomainProcessor indexed newVerifyDomainProcessor
    );

    /* ============ Modifiers ============ */
    modifier onlyInitialized() {
        require(isInitialized, "Contract must be initialized");
        _;
    }

    /* ============ Public Variables ============ */
    IVerifyDomainProcessor public verifyDomainProcessor;

    bool public isInitialized;

    mapping(bytes32 => Domain) public domains;
    mapping(address => bytes32[]) public userDomains;

    /* ============ Constructor ============ */
    
    constructor() Ownable() {}

    /* ============ Public Functions ============ */

    /**
     * @notice Verify domains and add them to the registry. If domain is transferred off-chain to another party 
     * then they can re-verify the domain and claim ownership of the domain and previous ownership is removed.
     * The existing owner can re-verify the domain, say after the domain has expired to update the expiry time on
     * the domain. Function reverts if:
     * - Domain ownership TLS proofs are invalid
     * 
     * @param _proofs           Array of domain ownership TLS proofs
     */
    function verifyDomains(IVerifyDomainProcessor.Proof[] memory _proofs) external override
        onlyInitialized
    {
        IVerifyDomainProcessor.DomainRaw[] memory rawDomains = verifyDomainProcessor.verifyProofs(
            _proofs
        );

        for (uint256 i = 0; i < rawDomains.length; i++) {
            IVerifyDomainProcessor.DomainRaw memory rawDomain = rawDomains[i];
            bytes32 domainId = getDomainId(rawDomain.name);

            Domain storage domain = domains[domainId];
            if (domain.owner == address(0)) {
                // Case 1.1: Domain has no owner
                // Add caller as owner
                userDomains[msg.sender].push(domainId);
            } else {
                // Case 2: Domain has owner
                // Case 2.1: Caller is owner; skip
                // Case 2.2: Caller is NOT owner
                if (domain.owner != msg.sender) {
                    // Remove ownership from old owner and add caller as new owner
                    userDomains[domain.owner].removeStorage(domainId);
                    userDomains[msg.sender].push(domainId);
                }
            }

            domains[domainId] = Domain({
                owner: msg.sender,
                name: rawDomain.name,
                expiryTime: rawDomain.expiryTime
            });
            
            emit DomainVerified(domainId, msg.sender, rawDomain.name, rawDomain.expiryTime);
        }
    }

    /* ============ Admin Functions ============ */

    /**
     * @notice ONLY OWNER: Initialize the contract with the VerifyDomainProcessor and exchange contracts.
     * This can only be called once.
     *
     * @param _verifyDomainProcessor    Address of the VerifyDomainProcessor contract
     */
    function initialize(
        IVerifyDomainProcessor _verifyDomainProcessor
    )
        external
        onlyOwner
    {
        require(!isInitialized, "Already initialized");

        verifyDomainProcessor = _verifyDomainProcessor;

        isInitialized = true;

        emit VerifyDomainProcessorUpdated(_verifyDomainProcessor);
    }

    /**
     * @notice ONLY OWNER: Update the verify domain processor
     *
     * @param _verifyDomainProcessor    Address of the new VerifyDomainProcessor contract
     */
    function updateVerifyDomainProcessor(IVerifyDomainProcessor _verifyDomainProcessor) external onlyOwner {
        require(address(_verifyDomainProcessor) != address(0), "Invalid address");

        verifyDomainProcessor = _verifyDomainProcessor;
        emit VerifyDomainProcessorUpdated(_verifyDomainProcessor);
    }

    /* ============ View Functions ============ */

    function getDomainId(string memory _domainName) public pure override returns (bytes32) {
        return keccak256(abi.encodePacked(_domainName));
    }

    function getDomainOwner(bytes32 _domainId) external view override returns (address) {        
        return domains[_domainId].owner;
    }

    function getUserDomains(address _user) external view returns (DomainWithId[] memory domainInfo) {
        bytes32[] memory domainIds = userDomains[_user];
        
        domainInfo = new DomainWithId[](domainIds.length);
        for (uint256 i = 0; i < domainIds.length; i++) {
            bytes32 domainId = domainIds[i];
            domainInfo[i] = DomainWithId({
                domainId: domainId,
                domain: domains[domainId]
            });
        }
    }

    function getDomains(bytes32[] memory _domains) external view returns (DomainWithId[] memory domainInfo) {
        domainInfo = new DomainWithId[](_domains.length);
        for (uint256 i = 0; i < _domains.length; i++) {
            bytes32 domainId = _domains[i];
            domainInfo[i] = DomainWithId({
                domainId: domainId,
                domain: domains[domainId]
            });
        }
    }
}