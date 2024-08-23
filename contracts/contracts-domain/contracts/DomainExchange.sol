// SPDX-License-Identifier: MIT

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import { AddressAllowList } from "./external/AddressAllowList.sol";
import { Bytes32ArrayUtils } from "./external/lib/Bytes32ArrayUtils.sol";
import { Uint256ArrayUtils } from "./external/lib/Uint256ArrayUtils.sol";

import { ITransferDomainProcessor } from "./interfaces/ITransferDomainProcessor.sol";
import { IVerifiedDomainRegistry } from "./interfaces/IVerifiedDomainRegistry.sol";
import { IVerifyDomainProcessor } from "./interfaces/IVerifyDomainProcessor.sol";

pragma solidity ^0.8.18;

contract DomainExchange is AddressAllowList, ReentrancyGuard {

    using Address for address payable;
    using Bytes32ArrayUtils for bytes32[];
    using Uint256ArrayUtils for uint256[];

    /* ============ Events ============ */
    
    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 askPrice);
    event ListingUpdated(uint256 indexed listingId, address indexed seller, uint256 newAskPrice);
    event ListingDeleted(uint256 indexed listingId, address indexed seller);
    
    event BidCreated(uint256 indexed bidId, uint256 indexed listingId, address indexed buyer, uint256 price);
    event BidPriceUpdated(uint256 indexed bidId, address indexed buyer, uint256 newPrice);
    event RefundInitiated(uint256 indexed bidId, address indexed buyer);
    event BidWithdrawn(uint256 indexed bidId, address indexed buyer, uint256 amount);
    
    event SaleFinalized(uint256 indexed bidId, uint256 priceNetFees, uint256 fees);
    
    event FeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address indexed newFeeRecipient);
    event BidSettlementPeriodUpdated(uint256 newBidSettlementPeriod);
    event BidRefundPeriodUpdated(uint256 newBidRefundPeriod);

    /* ============ Structs ============ */
    struct Listing {
        address seller;
        bytes encryptionKey;
        bytes32 domainId;
        uint256 createdAt;
        uint256 askPrice;
        bool isActive;          // false by default, set to true when the listing is created
        uint256[] bids;
    }

    struct ListingWithId {
        uint256 listingId;
        Listing listing;
    }

    struct Bid {
        address buyer;
        uint256 listingId;
        string encryptedBuyerId;
        bytes32 buyerIdHash;
        uint256 createdAt;
        uint256 expiryTimestamp;
        uint256 price;
        bool refundInitiated;
    }

    struct BidWithId {
        uint256 bidId;
        Bid bid;
    }

    /* ============ Modifiers ============ */
    modifier onlyInitialized() {
        require(isInitialized, "Contract must be initialized");
        _;
    }

    /* ============ Public Variables ============ */

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;
    mapping(uint256 => Bid) public bids;
    mapping(address => uint256[]) public userBids;
    mapping(bytes32 => uint256) public domainListing;

    uint256 public fee;
    address public feeRecipient;
    uint256 public bidCounter;
    uint256 public listingCounter;
    uint256 public bidSettlementPeriod;
    uint256 public bidRefundPeriod;
    
    bool public isInitialized;
    
    IVerifyDomainProcessor public verifyDomainProcessor;
    ITransferDomainProcessor public transferDomainProcessor;
    IVerifiedDomainRegistry public verifiedDomainRegistry;

    /* ============ Constants ============ */
    uint256 internal constant PRECISE_UNIT = 1e18;

    /* ============ Constructor ============ */

    constructor(
        address _owner,
        uint256 _fee,
        address _feeRecipient,
        uint256 _bidSettlementPeriod,
        uint256 _bidRefundPeriod,
        address[] memory _allowedAddresses
    ) AddressAllowList(_allowedAddresses) {
        fee = _fee;
        feeRecipient = _feeRecipient;
        bidSettlementPeriod = _bidSettlementPeriod;
        bidRefundPeriod = _bidRefundPeriod;
        
        bidCounter = 1;
        listingCounter = 1;
        isInitialized = false;
        
        transferOwnership(_owner);
    }

    /* ============ Public Functions ============ */

    /**
     * @notice Creates listing for a domain. If ownership of domain changes offchain, the new owner
     * will have to first register the domain on the domain registry contract. Then the new owner
     * can create a listing for the domain. The old listing will be deleted from the old owner's 
     * listings and the old listing is marked as withdrawn, which prevents any new bids from being
     * created on it and makes the old bids immediately withdrawable.
     * Function reverts if:
     * - Caller is not domain owner on the domain registry contract
     * - Ask price is 0
     *
     * @param _domainId         The unique identifier of the domain
     * @param _askPrice         An asking price for the domain
     * @param _encryptionKey    The encryption key for buyers to encrypt the buyerId to
     */
    function createListing(bytes32 _domainId, uint256 _askPrice, bytes memory _encryptionKey) 
        external
        onlyAllowed
        onlyInitialized 
    {
        address domainOwner = verifiedDomainRegistry.getDomainOwner(_domainId);
        require(domainOwner == msg.sender, "Caller is not domain owner");
        require(_askPrice > 0, "Ask price is zero");
        
        uint256 listingId = _updateCreateListingState(_domainId, _askPrice, _encryptionKey);

        emit ListingCreated(listingId, msg.sender, _askPrice);
    }

    /**
     * @notice Creates a new bid for a listing. Transfers ETH from the buyer to the contract. Every buyer
     * has a unique identifier, for Namecheap it's their username. The seller needs the raw buyerId
     * to transfer the domain off-chain. To facilitate this, the buyer encrypts their buyerId using the 
     * seller's encryption key and sends it along with the bid. The seller then decrypts the buyerId 
     * using their private key to get the raw buyerId.
     *
     * DEV NOTE: We do not check that the encrypted buyerId is the same as the hashed buyerId. This must be
     * done in the client! This does not affect the security of the protocol as the encrypted buyerId is only 
     * used for communication between the buyer and the seller while maintaining privacy.
     *
     * @param _listingId            The unique identifier of the listing to bid on
     * @param _buyerIdHash          The hashed buyerId which is also output as part of the transfer proof later
     * @param _encryptedBuyerId     The encrypted buyerId. Should be the same as the buyerId hashed
     */
    function createBid(uint256 _listingId, bytes32 _buyerIdHash, string memory _encryptedBuyerId) 
        external 
        payable
        nonReentrant
    {
        uint256 price = msg.value;
        Listing storage listing = listings[_listingId];

        _validateCreateBid(listing, price, _buyerIdHash);

        uint256 bidId = _updateCreateBidState(listing, _listingId, price, _buyerIdHash, _encryptedBuyerId);

        emit BidCreated(bidId, _listingId, msg.sender, price);
    }

    /**
     * @notice ONLY SELLER: Finalizes a sale by verifying the domain transfer and unlocking bid funds to 
     * the listing owner. The seller can also finalize the sale with bids that have initiated a refund 
     * including the ones that have expired based on timestamp but not withdrawn yet.
     *
     * @param _proof The zk-email proof of domain transfer
     */
    function finalizeSale(ITransferDomainProcessor.TransferProof calldata _proof) 
        external
        onlyInitialized
        nonReentrant
    {
        // Check
        (
            bytes32 hashedReceiverId, 
            string memory domainName, 
            uint256 bidId
        ) = transferDomainProcessor.processProof(_proof);        

        Bid storage bid = bids[bidId];
        Listing storage listing = listings[bid.listingId];
        
        _validateFinalizeSale(bid, listing, hashedReceiverId, domainName);
        
        // Effect
        uint256 transferValue = bid.price;
        _updateFinalizeSaleState(bid, bidId, listing);

        // Interaction
        uint256 feeAmount = _settleSale(msg.sender, transferValue);
        
        emit SaleFinalized(bidId, transferValue - feeAmount, feeAmount);
    }

    /**
     * @notice ONLY BUYER: Finalize a sale by releasing funds to the seller. Proof of transfer is not required
     * because it is not in the buyer's interest to release funds unless they have received the domain. Note that the
     * bid can be in ANY STATE when this function is called. Upon calling this function funds will be transferred to
     * the seller and fees will be taken by the protocol. The listing and the bid will be deleted. The function will
     * revert if:
     * - The bid is not owned by the caller
     * - The listing is expired (sold or withdrawn)
     *
     * @param _bidId The unique identifier of the bid to release funds for
     */
    function buyerReleaseFunds(uint256 _bidId) 
        external
        nonReentrant
    {
        // Check
        Bid storage bid = bids[_bidId];
        Listing storage listing = listings[bid.listingId];

        require(bid.buyer == msg.sender, "Caller is not bid owner");
        require(listing.isActive, "Listing is expired");

        // Effect
        uint256 transferValue = bid.price;
        address recipient = listing.seller;
        _updateFinalizeSaleState(bid, _bidId, listing);

        // Interaction
        uint256 feeAmount = _settleSale(recipient, transferValue);

        emit SaleFinalized(_bidId, transferValue - feeAmount, feeAmount);
    }

    /**
     * @notice ONLY SELLER: Updates the asking price of an existing listing. We don't update
     * the existing bids against the listing because the newAskPrice is an indicative value. 
     * We do prevent new bids from being created with a price less than the newAskPrice.
     *
     * @param _listingId The unique identifier of the listing to update
     * @param _newAskPrice The new asking price for the listing
     */
    function updateListing(uint256 _listingId, uint256 _newAskPrice) external {
        Listing storage listing = listings[_listingId];
        
        require(listing.seller == msg.sender, "Caller is not listing owner");
        require(listing.isActive, "Listing is expired");
        
        listing.askPrice = _newAskPrice;

        emit ListingUpdated(_listingId, msg.sender, _newAskPrice);
    }

    /**
     * @notice ONLY SELLER: Deletes an existing listing. Prunes all bids against the listing. 
     *
     * @param _listingId The unique identifier of the listing to delete
     */
    function deleteListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        
        require(listing.seller == msg.sender, "Caller is not listing owner");
        require(listing.isActive, "Listing is expired");
        
        _pruneListing(listing, _listingId);

        emit ListingDeleted(_listingId, msg.sender);
    }

    /**
     * @notice ONLY BUYER: Updates the price of an existing bid. Handles ETH transfers for price
     * changes. The new price can be higher or lower than the old price. If the new price is
     * higher, the buyer must send the additional amount of ETH. If the new price is lower, the
     * buyer will receive a refund for the difference. But the new price must be at least the ask
     * price of the listing.
     *
     * @param _bidId The unique identifier of the bid to update
     * @param _newPrice The new price for the bid
     */
    function updateBidPrice(uint256 _bidId, uint256 _newPrice) 
        external
        payable
        nonReentrant
    {
        Bid storage bid = bids[_bidId];
        Listing storage listing = listings[bid.listingId];

        // Check
        _validateUpdateBidPrice(bid, listing, _newPrice);
        if (_newPrice > bid.price) {
            uint256 additionalAmount = _newPrice - bid.price;
            require(msg.value >= additionalAmount, "Incorrect amount of ETH sent");
        }
        
        // Effect
        uint256 _oldPrice = bid.price;
        bid.price = _newPrice;

        // Interaction
        if (_oldPrice > _newPrice) {
            uint256 refundAmount = _oldPrice - _newPrice;
            payable(msg.sender).sendValue(refundAmount);
        }

        emit BidPriceUpdated(_bidId, msg.sender, _newPrice);
    }


    /**
     * @notice ONLY BUYER: Initiates the refund process for a bid. Can only be called by the bid owner 
     * after the initial bid expiry period has passed.
     *
     * @param _bidId The unique identifier of the bid to initiate refund for
     */
    function initiateRefund(uint256 _bidId) external {
        Bid storage bid = bids[_bidId];
        Listing storage listing = listings[bid.listingId];

        _validateInitiateRefund(bid, listing);

        bid.expiryTimestamp = block.timestamp + bidRefundPeriod;
        bid.refundInitiated = true;

        emit RefundInitiated(_bidId, bid.buyer);
    }

    /**
     * @notice ONLY BUYER: Withdraws a bid after the refund period has ended. Transfers ETH back to the buyer.
     *
     * @param _bidId The unique identifier of the bid to withdraw
     */
    function withdrawBid(uint256 _bidId) external nonReentrant {
        Bid storage bid = bids[_bidId];
        Listing storage listing = listings[bid.listingId];

        // Check
        _validateWithdrawBid(bid, listing);

        // Effect
        uint256 refundAmount = bid.price;
        _pruneBid(bid, _bidId, listing);
        
        // Interaction
        payable(msg.sender).sendValue(refundAmount);

        emit BidWithdrawn(_bidId, msg.sender, refundAmount);
    }

    /* ============ Admin Functions ============ */

    /**
     * @notice Initializes the contract with domain verification and transfer processors. Can 
     * only be called once by the contract owner
     * 
     * @param _verifyDomainProcessor The address of the domain verification processor contract
     * @param _transferDomainProcessor The address of the domain transfer processor contract
     * @param _verifiedDomainRegistry The address of the verified domain registry contract
     */
    function initialize(
        IVerifyDomainProcessor _verifyDomainProcessor,
        ITransferDomainProcessor _transferDomainProcessor,
        IVerifiedDomainRegistry _verifiedDomainRegistry
    ) external onlyOwner {
        require(!isInitialized, "Already initialized");
        verifyDomainProcessor = _verifyDomainProcessor;
        transferDomainProcessor = _transferDomainProcessor;
        verifiedDomainRegistry = _verifiedDomainRegistry;
        isInitialized = true;
    }

    // Add admin functions to update processors

    /**
     * @notice ONLY OWNER: Updates the fee percentage for the marketplace
     *
     * @param _newFee The new fee percentage (in basis points)
     */
    function updateFee(uint256 _newFee) external onlyOwner {
        fee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /**
     * @notice ONLY OWNER: Updates the fee recipient address
     *
     * @param _newFeeRecipient The new address to receive fees
     */
    function updateFeeRecipient(address _newFeeRecipient) external onlyOwner {
        require(_newFeeRecipient != address(0), "Invalid address");
        feeRecipient = _newFeeRecipient;
        emit FeeRecipientUpdated(_newFeeRecipient);
    }

    /**
     * @notice ONLY OWNER: Updates the minimum bid active period
     *
     * @param _newBidSettlementPeriod The new bid settlement period in seconds
     */
    function updateBidSettlementPeriod(uint256 _newBidSettlementPeriod) external onlyOwner {
        require(_newBidSettlementPeriod > 0, "Bid settlement period must be greater than 0");
        bidSettlementPeriod = _newBidSettlementPeriod;
        emit BidSettlementPeriodUpdated(_newBidSettlementPeriod);
    }

    /**
     * @notice ONLY OWNER: Updates the bid refund period
     *
     * @param _newBidRefundPeriod The new bid refund period in seconds
     */
    function updateBidRefundPeriod(uint256 _newBidRefundPeriod) external onlyOwner {
        require(_newBidRefundPeriod > 0, "Bid refund period must be greater than 0");
        bidRefundPeriod = _newBidRefundPeriod;
        emit BidRefundPeriodUpdated(_newBidRefundPeriod);
    }

    /* ============ View Functions ============ */    

    /**
     * @notice Get listing information with listingId for a list of listingIds
     * @param _listingIds An array of listingIds to fetch details for
     */
    function getListings(uint256[] memory _listingIds)
        external 
        view 
        returns (ListingWithId[] memory listingInfo) 
    {
        listingInfo = new ListingWithId[](_listingIds.length);
        for (uint256 i = 0; i < _listingIds.length; i++) {
            listingInfo[i] = ListingWithId({
                listingId: _listingIds[i],
                listing: listings[_listingIds[i]]
            });
        }
    }

    /**
     * @notice Returns all listings created by a user
     * @param _user The address of the user to fetch listings for
     */
    function getUserListings(address _user) external view returns (ListingWithId[] memory listingInfo) {
        uint256[] memory userListingIds = userListings[_user];
        listingInfo = new ListingWithId[](userListingIds.length);
        for (uint256 i = 0; i < userListingIds.length; i++) {
            uint256 listingId = userListingIds[i];
            listingInfo[i] = ListingWithId({
                listingId: listingId,
                listing: listings[listingId]
            });
        }
    }

    /**
     * @notice Returns the bids created by a user
     * @param _user The address of the user to fetch bids for
     */
    function getUserBids(address _user) external view returns (BidWithId[] memory bidInfo) {
        uint256[] memory userBidIds = userBids[_user];
        bidInfo = new BidWithId[](userBidIds.length);
        for (uint256 i = 0; i < userBidIds.length; i++) {
            uint256 bidId = userBidIds[i];
            bidInfo[i] = BidWithId({
                bidId: bidId,
                bid: bids[bidId]
            });
        }
    }

    /**
     * @notice Returns the bids for given listingIds
     * @param _listingIds An array of listingIds to fetch bids for
     */
    function getListingBids(uint256[] memory _listingIds) external view returns (BidWithId[][] memory bidInfo) {
        bidInfo = new BidWithId[][](_listingIds.length);
        for (uint256 i = 0; i < _listingIds.length; i++) {
            uint256 listingId = _listingIds[i];
            uint256[] memory listingBidIds = listings[listingId].bids;
            bidInfo[i] = new BidWithId[](listingBidIds.length);
            for (uint256 j = 0; j < listingBidIds.length; j++) {
                uint256 bidId = listingBidIds[j];
                bidInfo[i][j] = BidWithId({
                    bidId: bidId,
                    bid: bids[bidId]
                });
            }
        }
    }

    /**
     * @notice Get all allowed sellers
     */
    function getAllowedSellers() external view returns (address[] memory) {
        return _getAllowedAddresses();
    }

    /**
     * @notice Get the active listing for given domain id
     * @param _domainId The domain id to fetch the active listing for
     */
    function getDomainListing(bytes32 _domainId) external view returns (ListingWithId memory) {
        uint256 listingId = domainListing[_domainId];
        return ListingWithId({
            listingId: listingId,
            listing: listings[listingId]
        });
    }

    /* ============ Internal Functions ============ */

    function _updateCreateListingState(
        bytes32 _domainId, 
        uint256 _askPrice, 
        bytes memory _encryptionKey
    ) internal returns (uint256 listingId) {
        
        // If listing already exists, delete the old listing
        uint256 oldListingId = domainListing[_domainId];
        if (oldListingId != 0) {
            Listing storage listing = listings[oldListingId];
            _pruneListing(listing, oldListingId);
        }
        
        // New listing
        listingId = listingCounter;
        listings[listingId] = Listing({
            seller: msg.sender,
            encryptionKey: _encryptionKey,
            askPrice: _askPrice,
            domainId: _domainId,
            createdAt: block.timestamp,
            isActive: true,
            bids: new uint256[](0)
        });
        userListings[msg.sender].push(listingId);
        domainListing[_domainId] = listingId;

        // Increment listingCounter
        listingCounter = listingCounter + 1;
    }

    function _validateCreateBid(Listing storage _listing, uint256 _price, bytes32 _buyerIdHash) internal view {
        require(_listing.seller != address(0), "Listing does not exist");
        require(_listing.isActive, "Listing is expired");
        
        // Validate inputs
        require(_price > 0, "Bid price must be greater than 0");
        require(_buyerIdHash != bytes32(0), "Buyer ID hash cannot be empty");
    }

    function _updateCreateBidState(
        Listing storage _listing, 
        uint256 _listingId, 
        uint256 _price, 
        bytes32 _buyerIdHash, 
        string memory _encryptedBuyerId
    ) internal returns (uint256 bidId) {
        bidId = bidCounter;
        bids[bidId] = Bid({
            buyer: msg.sender,
            listingId: _listingId,
            encryptedBuyerId: _encryptedBuyerId,
            buyerIdHash: _buyerIdHash,
            createdAt: block.timestamp,
            expiryTimestamp: type(uint256).max,
            price: _price,
            refundInitiated: false
        });
        userBids[msg.sender].push(bidId);
        _listing.bids.push(bidId);

        // Increment bidCounter
        bidCounter = bidCounter + 1;
    }

    function _validateFinalizeSale(
        Bid storage _bid, 
        Listing storage _listing,
        bytes32 _hashedReceiverId, 
        string memory _transferredDomainName
    ) internal view {
        require(_bid.buyer != address(0), "Bid does not exist");
        require(_listing.seller == msg.sender, "Caller is not listing owner");
        require(_listing.isActive, "Listing is expired");

        bytes32 transferredDomainId = keccak256(abi.encodePacked(_transferredDomainName));
        require(_bid.buyerIdHash == _hashedReceiverId, "Invalid receiver");
        require(_listing.domainId == transferredDomainId, "Invalid domain");
    }

    function _updateFinalizeSaleState(Bid storage _bid, uint256 _bidId, Listing storage _listing) internal {
        uint256 listingId = _bid.listingId;
        
        _pruneBid(_bid, _bidId, _listing);
        _pruneListing(_listing, listingId);
    }

    function _validateUpdateBidPrice(
        Bid storage _bid, 
        Listing storage _listing, 
        uint256 _newPrice
    ) internal view {
        require(_bid.buyer == msg.sender, "Caller is not bid owner");
        require(!_bid.refundInitiated, "Refund already initiated");
        require(_listing.isActive, "Listing is expired");

        // Validate new price
        require(_newPrice > 0, "New price must be greater than 0");
        require(_newPrice != _bid.price, "New price equals bid price");
    }

    function _validateInitiateRefund(Bid storage _bid, Listing storage _listing) internal view {
        require(_bid.buyer == msg.sender, "Caller is not bid owner");
        require(!_bid.refundInitiated, "Refund already initiated");
        require(block.timestamp > bidSettlementPeriod + _bid.createdAt, "Refund period not started");
        require(_listing.isActive, "Listing expired. Bid can be withdrawn directly");
    }

    function _validateWithdrawBid(Bid storage _bid, Listing storage _listing) internal view {
        require(_bid.buyer == msg.sender, "Caller is not bid owner");
        if (_listing.isActive) {
            require(_bid.refundInitiated, "Refund not initiated");
            require(block.timestamp >= _bid.expiryTimestamp, "Refund period not ended");
        }
    }

    function _settleSale(address _recipient, uint256 _amount) internal returns (uint256 feeAmount) {
        feeAmount = (_amount * fee) / PRECISE_UNIT;
        payable(_recipient).sendValue(_amount - feeAmount);

        if (feeAmount > 0) {
            payable(feeRecipient).sendValue(feeAmount);
        }
    }

    /**
     * @notice Deletes a bid from the exchange. Removes the bid from the listing's bids array and the buyer's
     * bids array. Deletes the listing if it is expired and has no bids.
     */
    function _pruneBid(Bid storage _bid, uint256 _bidId, Listing storage _listing) internal {
        userBids[_bid.buyer].removeStorage(_bidId);
        _listing.bids.removeStorage(_bidId);
        if (!_listing.isActive && _listing.bids.length == 0) {
            delete listings[_bid.listingId];
        }
        delete bids[_bidId];
    }

    /**
     * @notice Marks a listing as expired. Removes the listing from the seller's listings array and domain listing.
     * If the listing has no bids, it is deleted from the exchange.
     */
    function _pruneListing(Listing storage _listing, uint256 _listingId) internal {
        _listing.isActive = false;
        userListings[_listing.seller].removeStorage(_listingId);
        delete domainListing[_listing.domainId];
        if (_listing.bids.length == 0) {
            delete listings[_listingId];
        }
    }
}
