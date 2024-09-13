//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Bytes32ArrayUtils } from "./external/lib/Bytes32ArrayUtils.sol";
import { AddressArrayUtils } from "./external/lib/AddressArrayUtils.sol";

import { IDomainExchange } from "./interfaces/IDomainExchange.sol";
import { IVerifiedDomainRegistry } from "./interfaces/IVerifiedDomainRegistry.sol";
import { IVerifyDomainProcessor } from "./interfaces/IVerifyDomainProcessor.sol";


pragma solidity ^0.8.18;

contract VerifiedDomainRegistry is IVerifiedDomainRegistry, Ownable {

    using Bytes32ArrayUtils for bytes32[];
    using AddressArrayUtils for address[];

    /* ============ Events ============ */
    event DomainVerified(
        bytes32 indexed domainId,
        address indexed owner,
        string domainName,
        uint256 expiryTime
    );

    event DomainListed(
        bytes32 indexed domainId,
        address indexed exchange,
        uint256 indexed listingId
    );

    event DomainListingRemoved(
        bytes32 indexed domainId,
        address indexed exchange
    );

    event DomainTransferred(
        bytes32 indexed domainId,
        address indexed oldOwner,
        address indexed newOwner
    );


    event VerifyDomainProcessorUpdated(
        IVerifyDomainProcessor indexed newVerifyDomainProcessor
    );

    event ExchangeAdded(address indexed exchange);
    event ExchangeRemoved(address indexed exchange);

    /* ============ Modifiers ============ */
    modifier onlyExchange() {
        require(isExchange[msg.sender], "Caller must be exchange");
        _;
    }

    modifier onlyInitialized() {
        require(isInitialized, "Contract must be initialized");
        _;
    }

    /* ============ Public Variables ============ */
    IVerifyDomainProcessor public verifyDomainProcessor;
    address[] public exchanges;
    mapping(address=>bool) public isExchange;

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

                // Set domain details
                domains[domainId] = Domain({
                    owner: msg.sender,
                    name: rawDomain.name,
                    expiryTime: rawDomain.expiryTime,
                    exchange: address(0),
                    listingId: 0
                });
            } else {
                // Case 2: Domain has owner
                // Case 2.1: Caller is owner; skip
                if (domain.owner == msg.sender) {
                    // No updates to userDomains

                    // Update domain details; Only expiry time can change
                    // Owner and domain name cannot change
                    // Exchange and listingId are kept as is
                    domain.expiryTime = rawDomain.expiryTime;
                }
                // Case 2.2: Caller is NOT owner
                if (domain.owner != msg.sender) {
                    // Remove ownership from old owner
                    userDomains[domain.owner].removeStorage(domainId);

                    // Remove listing on exchange if it exists
                    if (domain.exchange != address(0)) {
                        IDomainExchange(domain.exchange).registryRemoveListing(domain.listingId);
                    }

                    // Add domain to new owner
                    userDomains[msg.sender].push(domainId);

                    // Set domain details except for domain name as it cannot change
                    domain.owner = msg.sender;
                    domain.expiryTime = rawDomain.expiryTime;
                    domain.exchange = address(0);
                    domain.listingId = 0;
                }
            }

            emit DomainVerified(domainId, msg.sender, rawDomain.name, rawDomain.expiryTime);
        }
    }

    // Todo: Add function for relinquishing ownership of domain

    /**
     * @notice ONLY EXCHANGE: Add a listing status to domain. We check that the domain has been verified and is
     * listed on the calling exchange. This sets the exchange and listingId of the domain.
     * 
     * @param _domainId     Domain to set listed status for
     * @param _listingId    Listing Id of domain on calling exchange
     */
    function setDomainListing(bytes32 _domainId, uint256 _listingId)
        external
        override
        onlyInitialized
        onlyExchange
    {
        Domain storage domain = domains[_domainId];

        require(domain.owner != address(0), "Domain must be verified");
        require(domain.exchange == address(0), "Domain already listed on another exchange");

        domain.exchange = msg.sender;
        domain.listingId = _listingId;

        emit DomainListed(_domainId, msg.sender, _listingId);
    }

    /**
     * @notice ONLY EXCHANGE: Remove a listing status from domain. We check that the calling exchange is the one
     * that the domain is listed on. This removes the exchange and listingId from the domain.
     * 
     * @param _domainId            Domain ID to update listing status for
     */
    function removeDomainListing(bytes32 _domainId) external override onlyInitialized onlyExchange {
        Domain storage domain = domains[_domainId];
        require(domain.exchange == msg.sender, "Domain not listed on calling exchange");

        _removeDomainListing(domain);

        emit DomainListingRemoved(_domainId, msg.sender);
    }

    /**
     * @notice ONLY EXCHANGE: Update domain on sale. We check that the calling exchange is the one that the domain
     * is listed on. This updates the ownership of the domain to the new owner as well as removes the listing status
     * from the domain.
     * 
     * @param _domainId            Domain ID to update listing status for
     * @param _newOwner            New owner of the domain
     */
    function updateDomainOnSale(bytes32 _domainId, address _newOwner) 
        external 
        override 
        onlyInitialized 
        onlyExchange 
    {
        Domain storage domain = domains[_domainId];
        require(domain.exchange == msg.sender, "Domain not listed on calling exchange");

        _removeDomainListing(domain);

        // Update ownership
        address oldOwner = domain.owner;
        domain.owner = _newOwner;
        userDomains[oldOwner].removeStorage(_domainId);
        userDomains[_newOwner].push(_domainId);

        emit DomainTransferred(_domainId, oldOwner, _newOwner);
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
     * @notice ONLY OWNER: Add an exchange to the registry. This can only be called after the contract has been initialized.
     * Exchange must not already exist in the registry.
     * 
     * @param _exchange     Address of the exchange contract
     */
    function addExchange(address _exchange) external onlyOwner onlyInitialized {
        require(!isExchange[_exchange], "Duplicate exchange");

        isExchange[_exchange] = true;
        exchanges.push(_exchange);

        emit ExchangeAdded(_exchange);
    }

    /**
     * @notice ONLY OWNER: Remove an exchange from the registry. Exchange must exist in the registry.
     * 
     * @param _exchange     Address of the exchange contract
     */
    function removeExchange(address _exchange) external onlyOwner onlyInitialized {
        require(isExchange[_exchange], "Exchange does not exist");

        isExchange[_exchange] = false;
        exchanges.removeStorage(_exchange);

        emit ExchangeRemoved(_exchange);
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

    function getDomain(bytes32 _domainId) external view override returns (DomainWithId memory domainInfo) {
        return DomainWithId({
            domainId: _domainId,
            domain: domains[_domainId]
        });
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

    function getExchanges() external view returns (address[] memory) {
        return exchanges;
    }

    /* ============ Internal Functions ============ */

    function _removeDomainListing(Domain storage _domain) internal {
        delete _domain.exchange;
        delete _domain.listingId;
    }
}