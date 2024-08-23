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
        string domainName
    );

    event DomainExpiryBufferUpdated(
        uint256 newDomainExpiryBuffer
    );

    /* ============ Modifiers ============ */
    modifier onlyInitialized() {
        require(isInitialized, "Contract must be initialized");
        _;
    }

    /* ============ Public Variables ============ */
    IVerifyDomainProcessor public verifyDomainProcessor;

    bool public isInitialized;
    uint256 public domainExpiryBuffer;

    mapping(bytes32 => Domain) public domains;
    mapping(address => bytes32[]) public userDomains;

    /* ============ Constructor ============ */
    
    constructor(
        uint256 _domainExpiryBuffer
    ) Ownable() {
        domainExpiryBuffer = _domainExpiryBuffer;
    }

    /* ============ Public Functions ============ */

    /**
     * @notice Verify domains and add them to the registry. We check that the domains are not close to expiration,
     * if not then we revert. If domain is transferred off-chain to another party then they can re-verify the domain
     * and claim ownership of the domain. Previous ownership is removed.
     * Function reverts if:
     * - Domains are close to expiry
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
            
            require(
                rawDomain.expiryTime > block.timestamp + domainExpiryBuffer, 
                "Domain about to be expired"
            );
            
            bytes32 domainId = getDomainId(rawDomain.name);

            // Delete domain ownership if it already exists
            Domain storage domain = domains[domainId];
            if (domain.owner != address(0)) {
                userDomains[domain.owner].removeStorage(domainId);
            }

            domains[domainId] = Domain({
                owner: msg.sender,
                name: rawDomain.name,
                expiryTime: rawDomain.expiryTime
            });
            userDomains[msg.sender].push(domainId);

            emit DomainVerified(domainId, msg.sender, rawDomain.name);
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
    }

    /**
     * @notice ONLY OWNER: Updates the domain expiry buffer
     *
     * @param _newDomainExpiryBuffer The new domain expiry buffer in seconds
     */
    function updateDomainExpiryBuffer(uint256 _newDomainExpiryBuffer) external onlyOwner {
        require(_newDomainExpiryBuffer > 0, "Domain expiry buffer must be greater than 0");
        domainExpiryBuffer = _newDomainExpiryBuffer;
        emit DomainExpiryBufferUpdated(_newDomainExpiryBuffer);
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