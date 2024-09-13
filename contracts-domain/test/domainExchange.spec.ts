
import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber, Bytes, BytesLike } from "ethers";

import { Account } from "@utils/test/types";
import { Domain, ReclaimProof } from "@utils/types";
import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

import DeployHelper from "@utils/deploys";
import { Address } from "@utils/types";
import { ONE_DAY_IN_SECONDS, ZERO, ONE, PRECISE_UNIT, ADDRESS_ZERO, MAX_UINT_256, ZERO_BYTES32 } from "@utils/constants";
import {
  calculateDomainId,
  convertToUnixTimestamp,
  generateProofsFromDomains,
  convertUnixTimestampToDateString,
  generateTransferProof
} from "@utils/protocolUtils";
import {
  DomainExchange,
  TransferDomainProcessorMock,
  VerifyDomainProcessorMock,
  ITransferDomainProcessor,
  IProxyBaseProcessor,
  IVerifyDomainProcessor,
  VerifiedDomainRegistry,
  ManagedKeyHashAdapterV2
} from "@utils/contracts";
import { Blockchain, ether } from "@utils/common";

const expect = getWaffleExpect();
const provider = ethers.provider;
const blockchain = new Blockchain(provider);


describe("DomainExchange", () => {
  let owner: Account;
  let notOwner: Account;
  let feeRecipient: Account;
  let seller: Account;
  let sellerSaleEthRecipient: Account;
  let otherSeller: Account;
  let notAllowedSeller: Account;
  let buyer: Account;
  let otherBuyer: Account;
  let secondExchange: Account;
  let verifiedDomainRegistryAccount: Account;
  let newMailServerKeyHashAdapter: Account;
  let newTransferDomainProcessor: Account;

  let verifyDomainProcessor: VerifyDomainProcessorMock;
  let xferDomainProcessor: TransferDomainProcessorMock;
  let verifiedDomainRegistry: VerifiedDomainRegistry;
  let exchange: DomainExchange;
  let mailServerKeyHashAdapter: ManagedKeyHashAdapterV2;

  let swapFee: BigNumber;
  let dkimKeyHash: BytesLike;
  let bidSettlementPeriod: BigNumber;
  let bidRefundPeriod: BigNumber;

  let deployer: DeployHelper;
  let snapshotId: string;

  before(async () => {
    [
      owner,
      notOwner,
      feeRecipient,
      seller,
      sellerSaleEthRecipient,
      otherSeller,
      buyer,
      otherBuyer,
      notAllowedSeller,
      secondExchange,
      newTransferDomainProcessor,
      newMailServerKeyHashAdapter,
      verifiedDomainRegistryAccount
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    swapFee = ether(0.01)     // 1% fee
    bidSettlementPeriod = ONE_DAY_IN_SECONDS;    // 1 day
    bidRefundPeriod = ONE_DAY_IN_SECONDS;   // 1 day
    dkimKeyHash = ethers.utils.hexlify(ethers.utils.randomBytes(32));

    verifyDomainProcessor = await deployer.deployVerifyDomainProcessorMock();
    verifiedDomainRegistry = await deployer.deployVerifiedDomainRegistry();
    xferDomainProcessor = await deployer.deployTransferDomainProcessorMock();
    mailServerKeyHashAdapter = await deployer.deployManagedKeyHashAdapterV2([dkimKeyHash]);

    await verifiedDomainRegistry.initialize(
      verifyDomainProcessor.address
    );

    exchange = await deployer.deployDomainExchange(
      owner.address,
      swapFee,
      feeRecipient.address,
      bidSettlementPeriod,
      bidRefundPeriod,
      [seller.address, otherSeller.address]
    );

    await verifiedDomainRegistry.addExchange(exchange.address);
    await verifiedDomainRegistry.addExchange(secondExchange.address);
  });

  beforeEach(async () => {
    snapshotId = await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertByIdAsync(snapshotId);
  });

  describe("#constructor", async () => {
    it("should set the correct parameters", async () => {
      expect(await exchange.owner()).to.equal(owner.address);
      expect(await exchange.fee()).to.equal(swapFee);
      expect(await exchange.feeRecipient()).to.equal(feeRecipient.address);
      expect(await exchange.bidSettlementPeriod()).to.equal(bidSettlementPeriod);
      expect(await exchange.bidRefundPeriod()).to.equal(bidRefundPeriod);
      expect(await exchange.bidCounter()).to.equal(ONE);
      expect(await exchange.listingCounter()).to.equal(ONE);
    });
  });

  describe("#initialize", async () => {
    let subjectTransferDomainProcessor: Address;
    let subjectVerifiedDomainRegistry: Address;
    let subjectMailServerKeyHashAdapter: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectTransferDomainProcessor = xferDomainProcessor.address;
      subjectVerifiedDomainRegistry = verifiedDomainRegistry.address;
      subjectMailServerKeyHashAdapter = mailServerKeyHashAdapter.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return exchange.connect(subjectCaller.wallet).initialize(
        subjectTransferDomainProcessor,
        subjectVerifiedDomainRegistry,
        subjectMailServerKeyHashAdapter
      );
    }

    it("should set the transfer domain processor", async () => {
      await subject();
      expect(await exchange.transferDomainProcessor()).to.equal(subjectTransferDomainProcessor);
    });


    it("should set the verified domain registry", async () => {
      await subject();
      expect(await exchange.verifiedDomainRegistry()).to.equal(subjectVerifiedDomainRegistry);
    });

    it("should set the mail server key hash adapter", async () => {
      await subject();
      expect(await exchange.mailServerKeyHashAdapter()).to.equal(subjectMailServerKeyHashAdapter);
    });

    it("should set isInitialized to true", async () => {
      await subject();
      expect(await exchange.isInitialized()).to.be.true;
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = notOwner;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when the contract is already initialized", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Already initialized");
      });
    });
  });

  context("when the contract has been initialized", async () => {
    let snapshotIdTwo: string;
    let shouldInitialize: boolean = true;

    let domainName1: string;
    let domainName2: string;
    let domainId1: BytesLike;
    let domainId2: BytesLike;
    let sellerEncryptionKey: string;
    let encryptedBuyerId: string;

    beforeEach(async () => {
      domainName1 = '0xsachink.xyz';
      domainName2 = 'groth16.xyz';
      let domains = [
        {
          name: domainName1,
          expiryTimestamp: '2025-07-08T07:01:00',
        } as Domain,
        {
          name: domainName2,
          expiryTimestamp: '2025-07-08T18:22:00',
        } as Domain
      ];
      let proofs = generateProofsFromDomains(domains);

      // Claim ownership of the domain
      await verifiedDomainRegistry.connect(seller.wallet).verifyDomains(proofs);

      domainId1 = calculateDomainId('0xsachink.xyz');
      domainId2 = calculateDomainId('groth16.xyz');

      if (shouldInitialize) {
        await exchange.initialize(
          xferDomainProcessor.address,
          verifiedDomainRegistry.address,
          mailServerKeyHashAdapter.address
        );
      }
      snapshotIdTwo = await blockchain.saveSnapshotAsync();

      sellerEncryptionKey = "0x" + Buffer.from(ethers.utils.randomBytes(32)).toString("hex");
      encryptedBuyerId = "0x" + Buffer.from(ethers.utils.randomBytes(32)).toString("hex");
    });

    afterEach(async () => {
      await blockchain.revertByIdAsync(snapshotIdTwo);
    });

    function getHashedBuyerId(buyerId: string): BytesLike {
      return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(buyerId));
    }

    describe("#createListing", async () => {
      let subjectDomainId: BytesLike;
      let subjectSaleEthRecipient: Address;
      let subjectAskPrice: BigNumber;
      let subjectMinBidPrice: BigNumber;
      let subjectCaller: Account;
      let subjectEncryptionKey: string;
      let subjectDkimKeyHash: BytesLike;

      beforeEach(async () => {
        subjectDomainId = domainId1;
        subjectSaleEthRecipient = seller.address;
        subjectAskPrice = ether(1);
        subjectMinBidPrice = ether(0.5);
        subjectCaller = seller;
        subjectEncryptionKey = sellerEncryptionKey;
        subjectDkimKeyHash = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).createListing(
          subjectDomainId,
          subjectAskPrice,
          subjectMinBidPrice,
          subjectSaleEthRecipient,
          subjectEncryptionKey,
          subjectDkimKeyHash
        );
      }

      it("should create new listing", async () => {
        await subject();

        const listingId = (await exchange.listingCounter()).sub(1);
        const listing = await exchange.listings(listingId);

        expect(listing.seller).to.equal(subjectCaller.address);
        expect(listing.encryptionKey).to.equal(subjectEncryptionKey);
        expect(listing.askPrice).to.equal(subjectAskPrice);
        expect(listing.minBidPrice).to.equal(subjectMinBidPrice);
        expect(listing.createdAt).to.equal(await blockchain.getCurrentTimestamp());
        expect(listing.domainId).to.equal(domainId1);
        expect(listing.isActive).to.be.true;
        expect(listing.saleEthRecipient).to.equal(subjectSaleEthRecipient);
      });

      it("should update userListings", async () => {
        await subject();

        const listingId = (await exchange.listingCounter()).sub(1);
        const userListings = await exchange.getUserListings(subjectCaller.address);
        expect(userListings.length).to.equal(1);
        expect(userListings[0].listingId).to.equal(listingId);
        expect(userListings[0].listing.seller).to.equal(subjectCaller.address);
        expect(userListings[0].listing.askPrice).to.equal(subjectAskPrice);
        expect(userListings[0].listing.minBidPrice).to.equal(subjectMinBidPrice);
        expect(userListings[0].listing.isActive).to.be.true;
        expect(userListings[0].listing.saleEthRecipient).to.equal(subjectSaleEthRecipient);
      });

      it("should increment the listing counter", async () => {
        const listingCounter = await exchange.listingCounter();
        await subject();
        expect(await exchange.listingCounter()).to.equal(listingCounter.add(1));
      });

      it("should emit ListingCreated event", async () => {
        const listingId = await exchange.listingCounter(); // get listing counter before creating listing
        await expect(subject()).to.emit(exchange, "ListingCreated").withArgs(
          listingId,
          subjectCaller.address,
          subjectDomainId,
          subjectDkimKeyHash,
          subjectAskPrice,
          subjectMinBidPrice,
          subjectSaleEthRecipient
        );
      });

      it("should update domain listing and exchange status on registry", async () => {
        await subject();

        const domainDetails = await verifiedDomainRegistry.getDomain(domainId1);
        const expectedListingId = (await exchange.listingCounter()).sub(1);

        expect(domainDetails.domain.listingId).to.equal(expectedListingId);
        expect(domainDetails.domain.exchange).to.equal(exchange.address);
      });

      describe("when caller is not domain owner", async () => {
        beforeEach(async () => {
          subjectCaller = otherSeller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not domain owner");
        });
      });

      describe("when domain is already listed on another exchange", async () => {
        beforeEach(async () => {
          await verifiedDomainRegistry.connect(secondExchange.wallet).setDomainListing(domainId1, ONE);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Domain already listed on registry");
        });
      });

      describe("when the seller is not allowed", async () => {
        beforeEach(async () => {
          subjectCaller = notAllowedSeller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Address is not allowed");
        });
      });

      describe("when the min bid price is zero", async () => {
        beforeEach(async () => {
          subjectMinBidPrice = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Minimum bid price is zero");
        });
      });

      describe("when the dkim key hash is the zero hash", async () => {
        beforeEach(async () => {
          subjectDkimKeyHash = ethers.constants.HashZero;
        });

        it("should NOT revert", async () => {
          await expect(subject()).to.not.be.reverted;
        });
      });

      describe("when the sale eth recipient is the zero address", async () => {
        beforeEach(async () => {
          subjectSaleEthRecipient = ADDRESS_ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Invalid sale ETH recipient");
        });
      });

      describe("when the ask price is less than min bid price", async () => {
        beforeEach(async () => {
          subjectAskPrice = ether(1);
          subjectMinBidPrice = ether(1.01);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ask price is less than min bid price");
        });
      });

      describe("when the contract is not initialized", async () => {
        before(async () => {
          shouldInitialize = false;
        });

        after(async () => {
          shouldInitialize = true;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Contract must be initialized");
        });
      });

      describe("when the exchange is paused", async () => {
        beforeEach(async () => {
          await exchange.connect(owner.wallet).pauseMarketplace();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Pausable: paused");
        });

        describe("when the exchange is unpaused", async () => {
          beforeEach(async () => {
            await exchange.connect(owner.wallet).unpauseMarketplace();
          });

          it("should not revert", async () => {
            await expect(subject()).to.not.be.reverted;
          });
        });
      });
    });

    describe("#updateListing", async () => {
      let subjectListingId: BigNumber;
      let subjectNewPrice: BigNumber;
      let subjectSaleEthRecipient: Address;
      let subjectCaller: Account;

      let listingId: BigNumber;
      let minBidPrice: BigNumber;

      beforeEach(async () => {
        minBidPrice = ether(0.5);
        await exchange.connect(seller.wallet).createListing(
          domainId2,
          ether(5),
          minBidPrice,
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        subjectListingId = listingId;
        subjectNewPrice = ether(6);
        subjectSaleEthRecipient = sellerSaleEthRecipient.address;
        subjectCaller = seller;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).updateListing(
          subjectListingId,
          subjectNewPrice,
          subjectSaleEthRecipient
        );
      }

      it("should update listing", async () => {
        await subject();

        const listing = await exchange.listings(subjectListingId);
        expect(listing.askPrice).to.equal(subjectNewPrice);
        expect(listing.isActive).to.be.true;
        expect(listing.saleEthRecipient).to.equal(subjectSaleEthRecipient);
      });

      it("should emit ListingUpdated event", async () => {
        await expect(subject()).to.emit(exchange, "ListingUpdated").withArgs(
          subjectListingId,
          subjectCaller.address,
          subjectNewPrice,
          subjectSaleEthRecipient
        );
      });

      describe("when caller is not seller", async () => {
        beforeEach(async () => {
          subjectCaller = otherSeller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not listing owner");
        });
      });

      describe("when the new ask price is less than min bid price", async () => {
        beforeEach(async () => {
          subjectNewPrice = minBidPrice.sub(1);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ask price is less than min bid price");
        });
      });

      describe("when the sale eth recipient is the zero address", async () => {
        beforeEach(async () => {
          subjectSaleEthRecipient = ADDRESS_ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Invalid sale ETH recipient");
        });
      });

      describe("when the listing is not active", async () => {
        beforeEach(async () => {
          // Create bids against the listing so that it is only expired and not deleted
          await exchange.connect(buyer.wallet).createBid(
            subjectListingId,
            getHashedBuyerId("richardliang2015"),
            encryptedBuyerId,
            {
              value: ether(6)
            }
          );

          // Delete listing
          await exchange.connect(seller.wallet).deleteListing(subjectListingId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Listing not active");
        });
      });

      describe("when the exchange is paused", async () => {
        beforeEach(async () => {
          await exchange.connect(owner.wallet).pauseMarketplace();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Pausable: paused");
        });

        describe("when the exchange is unpaused", async () => {
          beforeEach(async () => {
            await exchange.connect(owner.wallet).unpauseMarketplace();
          });

          it("should not revert", async () => {
            await expect(subject()).to.not.be.reverted;
          });
        });
      });
    });

    describe("#deleteListing", async () => {
      let subjectListingId: BigNumber;
      let subjectCaller: Account;

      let listingId: BigNumber;
      let askPrice: BigNumber;

      beforeEach(async () => {
        // create listing
        askPrice = ether(5);
        await exchange.connect(seller.wallet).createListing(
          domainId2,
          askPrice,
          askPrice.sub(1),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        subjectListingId = listingId;
        subjectCaller = seller;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).deleteListing(subjectListingId);
      }

      it("should delete listing", async () => {
        await subject();

        const listing = await exchange.listings(subjectListingId);

        expect(listing.seller).to.equal(ADDRESS_ZERO);
        expect(listing.askPrice).to.equal(ZERO);
        expect(listing.createdAt).to.equal(0);
        expect(listing.domainId).to.equal(ZERO_BYTES32);
      });

      it("should delete listing from user's listings", async () => {
        await subject();

        const userListings = await exchange.getUserListings(subjectCaller.address);
        expect(userListings.length).to.equal(0);
      });

      it("should emit ListingDeleted event", async () => {
        await expect(subject()).to.emit(exchange, "ListingDeleted").withArgs(
          subjectListingId,
          subjectCaller.address
        );
      });

      it("should remove listing status from domain in verifiedDomainRegistry", async () => {
        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomain(domainId2);
        expect(domainInfo.domain.exchange).to.equal(ZERO);
        expect(domainInfo.domain.listingId).to.equal(ZERO);
      });

      describe("when there are bids against the listing", async () => {
        beforeEach(async () => {
          // create a bid for the listing
          await exchange.connect(buyer.wallet).createBid(
            listingId,
            getHashedBuyerId("0xsachink"),
            encryptedBuyerId,
            {
              value: ether(6)
            }
          );
        });

        it("should mark the listing as expired but not delete it", async () => {
          await subject();

          const listing = await exchange.listings(subjectListingId);

          expect(listing.seller).to.equal(subjectCaller.address);
          expect(listing.askPrice).to.equal(askPrice);
          expect(listing.isActive).to.be.false;
        });
      });

      describe("when caller is not owner", async () => {
        beforeEach(async () => {
          subjectCaller = otherSeller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not listing owner");
        });
      });
    });

    describe("#createBid", async () => {
      let subjectListingId: BigNumber;
      let subjectPrice: BigNumber;
      let subjectBuyerIdHash: BytesLike;
      let subjectCaller: Account;
      let subjectEncryptedBuyerId: string;

      let askPrice: BigNumber;
      let minBidPrice: BigNumber;

      beforeEach(async () => {
        // Create a listing
        askPrice = ether(5);
        minBidPrice = ether(0.5);
        await exchange.connect(seller.wallet).createListing(
          domainId1,
          askPrice,
          minBidPrice,
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        const listingId = (await exchange.listingCounter()).sub(1);

        // Richard wants to buy 0xsachink.xyz from seller (0xsachink)
        subjectListingId = listingId;
        subjectPrice = ether(6);
        subjectBuyerIdHash = getHashedBuyerId("richardliang2015");
        subjectCaller = buyer;
        subjectEncryptedBuyerId = encryptedBuyerId;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).createBid(
          subjectListingId,
          subjectBuyerIdHash,
          subjectEncryptedBuyerId,
          {
            value: subjectPrice
          }
        );
      }

      it("should create a new bid", async () => {
        await subject();

        const bidId = (await exchange.bidCounter()).sub(1);   // counter - 1
        const bid = await exchange.bids(bidId);

        expect(bid.buyer).to.equal(subjectCaller.address);
        expect(bid.listingId).to.equal(subjectListingId);
        expect(bid.buyerIdHash).to.equal(subjectBuyerIdHash);
        expect(bid.encryptedBuyerId).to.equal(subjectEncryptedBuyerId);
        expect(bid.price).to.equal(subjectPrice);
        expect(bid.refundInitiated).to.be.false;
        expect(bid.createdAt).to.equal(await blockchain.getCurrentTimestamp());
        expect(bid.expiryTimestamp).to.equal(MAX_UINT_256);
      });

      it("should add the bid to the user's bids", async () => {
        await subject();

        const bidId = (await exchange.bidCounter()).sub(1);   // counter - 1
        const userBids = await exchange.getUserBids(subjectCaller.address);

        expect(userBids.length).to.equal(1);
        expect(userBids[0].bidId).to.equal(bidId);
      });

      it("should add the bid to the listing's bids", async () => {
        await subject();

        const bidId = (await exchange.bidCounter()).sub(1);   // counter - 1
        const listingBids = await exchange.getListingBids([subjectListingId]);

        expect(listingBids.length).to.equal(1);
        expect(listingBids[0][0].bidId).to.equal(bidId);
      });

      it("should increment the bid counter", async () => {
        const initialBidCounter = await exchange.bidCounter();
        await subject();
        const finalBidCounter = await exchange.bidCounter();
        expect(finalBidCounter).to.equal(initialBidCounter.add(1));
      });

      it("should transfer ETH from the buyer to the contract", async () => {
        const initialContractBalance = await provider.getBalance(exchange.address);
        const initialBuyerBalance = await provider.getBalance(subjectCaller.address);

        await subject();

        const finalContractBalance = await provider.getBalance(exchange.address);
        const finalBuyerBalance = await provider.getBalance(subjectCaller.address);

        expect(finalContractBalance).to.equal(initialContractBalance.add(subjectPrice));
        expect(finalBuyerBalance).to.lt(initialBuyerBalance.sub(subjectPrice));   // account for gas
      });

      it("should emit a BidCreated event", async () => {
        await expect(subject()).to.emit(exchange, "BidCreated").withArgs(
          (await exchange.bidCounter()),      // This is fetched before subject() is called
          subjectListingId,
          subjectCaller.address,
          subjectPrice
        );
      });

      describe("when the bid price is lower than the asking price", async () => {
        beforeEach(async () => {
          subjectPrice = askPrice.sub(1);
        });

        it("should create a new bid", async () => {
          await subject();

          const bidId = (await exchange.bidCounter()).sub(1);
          const bid = await exchange.bids(bidId);
          expect(bid.price).to.equal(subjectPrice);
        });
      });

      describe("when the bid price is lower than the min bid price", async () => {
        beforeEach(async () => {
          subjectPrice = minBidPrice.sub(1);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Bid price is less than min bid price");
        });
      });

      describe("when the buyer ID hash is empty", async () => {
        beforeEach(async () => {
          subjectBuyerIdHash = ZERO_BYTES32;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Buyer ID hash cannot be empty");
        });
      });

      describe("when the listing does not exist", async () => {
        beforeEach(async () => {
          subjectListingId = (await exchange.listingCounter()).add(1);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Listing does not exist");
        });
      });

      describe("when the listing is not active, i.e. sold or withdrawn", async () => {
        beforeEach(async () => {
          await subject();    // Create a bid against the listing
          await exchange.connect(seller.wallet).deleteListing(subjectListingId);    // Delete the listing
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Listing not active");
        });
      });

      describe("when the exchange is paused", async () => {
        beforeEach(async () => {
          await exchange.connect(owner.wallet).pauseMarketplace();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Pausable: paused");
        });

        describe("when the exchange is unpaused", async () => {
          beforeEach(async () => {
            await exchange.connect(owner.wallet).unpauseMarketplace();
          });

          it("should not revert", async () => {
            await expect(subject()).to.not.be.reverted;
          });
        });
      });
    });

    describe("#increaseBidPrice", async () => {
      let subjectBidId: BigNumber;
      let subjectNewPrice: BigNumber;
      let subjectCaller: Account;
      let subjectValue: BigNumber;

      let bidPrice: BigNumber;
      let listingId: BigNumber;

      beforeEach(async () => {
        // create a listing
        await exchange.connect(seller.wallet).createListing(
          domainId2,
          ether(5),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        // create a bid
        bidPrice = ether(4);
        await exchange.connect(buyer.wallet).createBid(
          listingId,
          getHashedBuyerId("richardliang2015"),
          encryptedBuyerId,
          {
            value: bidPrice
          }
        );

        subjectBidId = (await exchange.bidCounter()).sub(1);
        subjectCaller = buyer;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).increaseBidPrice(subjectBidId, subjectNewPrice, {
          value: subjectValue
        });
      }

      describe("when bidding higher", async () => {
        beforeEach(async () => {
          subjectNewPrice = ether(6);
          subjectValue = ether(2);
        });

        it("should transfer ETH from buyer to contract", async () => {
          const initialContractBalance = await provider.getBalance(exchange.address);
          const initialBuyerBalance = await provider.getBalance(subjectCaller.address);

          const tx = await subject();
          const receipt = await tx.wait();

          const finalContractBalance = await provider.getBalance(exchange.address);
          const finalBuyerBalance = await provider.getBalance(subjectCaller.address);
          const expectedTransferAmount = subjectNewPrice.sub(bidPrice);

          expect(finalContractBalance).to.equal(initialContractBalance.add(expectedTransferAmount));
          expect(finalBuyerBalance).to.equal(initialBuyerBalance.sub(expectedTransferAmount).sub(receipt.effectiveGasPrice.mul(receipt.gasUsed)));
        });

        it("should update bid price", async () => {
          await subject();

          const bid = await exchange.bids(subjectBidId);
          expect(bid.price).to.equal(subjectNewPrice);
        });

        it("should emit BidPriceIncreased event", async () => {
          await expect(subject()).to.emit(exchange, "BidPriceIncreased").withArgs(
            subjectBidId,
            subjectCaller.address,
            subjectNewPrice
          );
        });

        describe("when new price is lower than the asking price but higher than old price", async () => {
          beforeEach(async () => {
            subjectNewPrice = ether(4.5);
            subjectValue = ether(0.5);
          });

          it("should NOT revert", async () => {
            await expect(subject()).to.not.be.reverted;
          });
        });
      });

      describe("when bidding lower", async () => {
        beforeEach(async () => {
          subjectNewPrice = bidPrice.sub(1);
          subjectValue = ether(0);
        });

        afterEach(async () => {
          subjectNewPrice = ether(6);
          subjectValue = ether(2);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("New price not greater than old price");
        });
      });

      describe("when bid price is zero", async () => {
        beforeEach(async () => {
          subjectNewPrice = ZERO;
        });

        afterEach(async () => {
          subjectNewPrice = ether(6);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("New price not greater than old price");
        });
      });

      describe("when new price is the same as the current price", async () => {
        beforeEach(async () => {
          subjectNewPrice = bidPrice;
        });

        afterEach(async () => {
          subjectNewPrice = ether(6);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("New price not greater than old price");
        });
      });

      describe("when caller is not bid owner", async () => {
        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not bid owner");
        });
      });

      describe("when bid does not exist", async () => {
        beforeEach(async () => {
          subjectBidId = (await exchange.bidCounter()).add(1);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not bid owner");
        });
      });

      describe("when bid refund has already been initiated", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(bidSettlementPeriod.add(1).toNumber());
          await exchange.connect(buyer.wallet).initiateRefund(subjectBidId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Refund already initiated");
        });
      });

      describe("when listing is not active", async () => {
        beforeEach(async () => {
          await exchange.connect(seller.wallet).deleteListing(listingId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Listing not active");
        });
      });

      describe("when the exchange is paused", async () => {
        beforeEach(async () => {
          await exchange.connect(owner.wallet).pauseMarketplace();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Pausable: paused");
        });

        describe("when the exchange is unpaused", async () => {
          beforeEach(async () => {
            await exchange.connect(owner.wallet).unpauseMarketplace();
          });

          it("should not revert", async () => {
            await expect(subject()).to.not.be.reverted;
          });
        });
      });
    });

    describe("#refundBid", async () => {
      let subjectBidId: BigNumber;
      let subjectCaller: Account;

      let listingId: BigNumber;

      beforeEach(async () => {
        // Create a listing
        await exchange.connect(seller.wallet).createListing(
          domainId2,
          ether(5),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        // Create a bid
        await exchange.connect(buyer.wallet).createBid(
          listingId,
          getHashedBuyerId("richardliang2015"),
          encryptedBuyerId,
          {
            value: ether(6)
          }
        );

        subjectBidId = (await exchange.bidCounter()).sub(1);
        subjectCaller = buyer;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).initiateRefund(subjectBidId);
      }

      describe("when bidSettlementPeriod has NOT passed", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(bidSettlementPeriod.sub(1).toNumber());
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Refund period not started");
        });
      });

      describe("when bidSettlementPeriod has passed", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(bidSettlementPeriod.add(1).toNumber());
        });

        it("should mark the bid as refunded", async () => {
          await subject();

          const bid = await exchange.bids(subjectBidId);
          expect(bid.refundInitiated).to.be.true;
        });

        it("should set the expiryTimestamp to the current time", async () => {
          await subject();

          const blockTimestamp = await blockchain.getCurrentTimestamp();
          const expectedExpiryTimestamp = blockTimestamp.add(bidSettlementPeriod);

          const bid = await exchange.bids(subjectBidId);
          expect(bid.expiryTimestamp).to.equal(expectedExpiryTimestamp);
        });

        it("should emit a RefundInitiated event", async () => {
          await expect(subject()).to.emit(exchange, "RefundInitiated").withArgs(
            subjectBidId,
            subjectCaller.address
          );
        });

        describe("when refund already initiated", async () => {
          beforeEach(async () => {
            await subject();
          })

          it("should revert", async () => {
            await expect(subject()).to.be.revertedWith("Refund already initiated");
          });
        });

        describe("when caller is not owner", async () => {
          beforeEach(async () => {
            subjectCaller = otherBuyer;
          });

          it("should revert", async () => {
            await expect(subject()).to.be.revertedWith("Caller is not bid owner");
          });
        });

        describe("when corresponding listing has expired", async () => {
          beforeEach(async () => {
            await exchange.connect(seller.wallet).deleteListing(listingId);
          });

          it("should revert", async () => {
            await expect(subject()).to.be.revertedWith("Listing expired. Bid can be withdrawn directly");
          });
        });
      });
    });

    describe("#withdrawBid", async () => {
      let subjectBidId: BigNumber;
      let subjectCaller: Account;

      let bidId: BigNumber;
      let bidPrice: BigNumber;
      let listingId: BigNumber;
      let hashedBuyerId: BytesLike;

      beforeEach(async () => {
        // Create a listing
        await exchange.connect(seller.wallet).createListing(
          domainId2,
          ether(5),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        // Create a bid
        hashedBuyerId = getHashedBuyerId("richardliang2015");
        bidPrice = ether(5);
        await exchange.connect(buyer.wallet).createBid(
          listingId,
          hashedBuyerId,
          encryptedBuyerId,
          {
            value: bidPrice
          }
        );
        bidId = (await exchange.bidCounter()).sub(1);

        // Increase blockchain time beyond bidSettlementPeriod
        await blockchain.increaseTimeAsync(bidSettlementPeriod.add(1).toNumber());

        // Initiate refund
        await exchange.connect(buyer.wallet).initiateRefund(bidId);

        subjectBidId = bidId;
        subjectCaller = buyer;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).withdrawBid(subjectBidId);
      }

      describe("when the bid has expired by passing of time", async () => {
        beforeEach(async () => {
          // Increase blockchain time beyond bidRefundPeriod
          await blockchain.increaseTimeAsync(bidRefundPeriod.add(1).toNumber());
        });

        it("should transfer ETH back to buyer", async () => {
          const initialContractBalance = await provider.getBalance(exchange.address);
          const initialBuyerBalance = await provider.getBalance(subjectCaller.address);

          const tx = await subject();
          const receipt = await tx.wait();

          const finalContractBalance = await provider.getBalance(exchange.address);
          const finalBuyerBalance = await provider.getBalance(subjectCaller.address);

          expect(finalContractBalance).to.equal(initialContractBalance.sub(bidPrice));
          expect(finalBuyerBalance).to.equal(initialBuyerBalance.add(bidPrice).sub(receipt.effectiveGasPrice.mul(receipt.gasUsed)));
        });

        it("should delete the bid from bids array", async () => {
          await subject();

          const bid = await exchange.bids(subjectBidId);

          expect(bid.buyer).to.equal(ADDRESS_ZERO);
          expect(bid.createdAt).to.equal(ZERO);
        });

        it("should delete the bid from userBids", async () => {
          await subject();

          const userBids = await exchange.getUserBids(subjectCaller.address);
          expect(userBids.length).to.equal(ZERO);
        });

        it("should delete bid from listings bids", async () => {
          await subject();

          const listingBids = await exchange.getListingBids([listingId]);
          expect(listingBids[0].length).to.equal(ZERO);
        });

        it("should not delete the listing", async () => {
          await subject();

          const listing = await exchange.listings(listingId);
          expect(listing.seller).to.equal(seller.address);
        });

        it("should emit a BidWithdrawn event", async () => {
          await expect(subject()).to.emit(exchange, "BidWithdrawn").withArgs(
            subjectBidId,
            buyer.address,
            bidPrice
          );
        });
      });

      describe("when the bid can be widthdrawn because listing was sold", async () => {
        let otherBidId: BigNumber;
        let otherBidPrice: BigNumber;

        beforeEach(async () => {
          // Other buyer creates a bid
          otherBidPrice = ether(6);
          await exchange.connect(otherBuyer.wallet).createBid(
            listingId,
            hashedBuyerId,
            encryptedBuyerId,
            {
              value: otherBidPrice
            }
          );
          otherBidId = (await exchange.bidCounter()).sub(1);

          // Seller finalizes the sale
          await xferDomainProcessor.setDomainName("groth16.xyz");   // Set domain name in mock
          const proof = generateTransferProof(dkimKeyHash, hashedBuyerId, bidId);  // bidId was selected
          await exchange.connect(seller.wallet).finalizeSale(proof);

          subjectCaller = otherBuyer;
          subjectBidId = otherBidId;    // this can be withdrawn
        });

        it("should transfer ETH back to buyer", async () => {
          const initialContractBalance = await provider.getBalance(exchange.address);
          const initialBuyerBalance = await provider.getBalance(subjectCaller.address);

          const tx = await subject();
          const receipt = await tx.wait();

          const finalContractBalance = await provider.getBalance(exchange.address);
          const finalBuyerBalance = await provider.getBalance(subjectCaller.address);

          expect(finalContractBalance).to.equal(initialContractBalance.sub(otherBidPrice));
          expect(finalBuyerBalance).to.equal(initialBuyerBalance.add(otherBidPrice).sub(receipt.effectiveGasPrice.mul(receipt.gasUsed)));
        });

        it("should delete the bid from bids array", async () => {
          await subject();

          const bid = await exchange.bids(subjectBidId);

          expect(bid.buyer).to.equal(ADDRESS_ZERO);
          expect(bid.createdAt).to.equal(ZERO);
        });

        it("should delete the bid from userBids", async () => {
          await subject();

          const userBids = await exchange.getUserBids(subjectCaller.address);
          expect(userBids.length).to.equal(ZERO);
        });

        it("should delete the listing as no more bids remain", async () => {
          await subject();

          const listing = await exchange.listings(listingId);
          expect(listing.seller).to.equal(ethers.constants.AddressZero);
        });

        it("should emit a BidWithdrawn event", async () => {
          await expect(subject()).to.emit(exchange, "BidWithdrawn").withArgs(
            subjectBidId,
            otherBuyer.address,
            otherBidPrice
          );
        });
      });

      describe("when refund period has NOT ended", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(bidRefundPeriod.sub(1).toNumber());
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Refund period not ended");
        });
      });

      describe("when the caller is not the buyer", async () => {
        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not bid owner");
        });
      });

      describe("when the bid does not exist", async () => {
        beforeEach(async () => {
          subjectBidId = bidId.add(1);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not bid owner");
        });
      });

      describe("when refund is not initiated", async () => {
        beforeEach(async () => {
          // create a new bid that has not initiated refund
          await exchange.connect(buyer.wallet).createBid(
            listingId,
            hashedBuyerId,
            encryptedBuyerId,
            {
              value: bidPrice
            }
          );

          subjectBidId = (await exchange.bidCounter()).sub(1);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Refund not initiated");
        });
      });
    });

    describe("#finalizeSale", async () => {
      let subjectCaller: Account;
      let subjectProof: ITransferDomainProcessor.TransferProofStruct;

      let proof: ITransferDomainProcessor.TransferProofStruct;
      let listingId: BigNumber;
      let bidPrice: BigNumber;
      let bidId: BigNumber;
      let otherBidId: BigNumber;
      let hashedBuyerId: BytesLike;

      beforeEach(async () => {
        if (shouldInitialize) {
          await exchange.connect(seller.wallet).createListing(
            domainId2,
            ether(5),
            ether(0.5),
            seller.address,
            sellerEncryptionKey,
            ethers.constants.HashZero
          );
          listingId = (await exchange.listingCounter()).sub(1);

          // Create a bid against groth16.xyz
          bidPrice = ether(6);
          hashedBuyerId = getHashedBuyerId("buyerId");
          await exchange.connect(buyer.wallet).createBid(
            listingId,
            hashedBuyerId,
            encryptedBuyerId,
            {
              value: bidPrice
            }
          );
          bidId = (await exchange.bidCounter()).sub(1);

          await xferDomainProcessor.setDomainName("groth16.xyz");   // Set domain name in mock
          proof = generateTransferProof(dkimKeyHash, hashedBuyerId, bidId);
        }

        subjectProof = proof;
        subjectCaller = seller;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).finalizeSale(subjectProof);
      }

      it("should transfer funds to the seller and fee recipient", async () => {
        const initialSellerBalance = await provider.getBalance(seller.address);
        const initialFeeRecipientBalance = await provider.getBalance(feeRecipient.address);

        const tx = await subject();
        const receipt = await tx.wait();

        const finalSellerBalance = await provider.getBalance(seller.address);
        const finalFeeRecipientBalance = await provider.getBalance(feeRecipient.address);

        const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
        const expectedFundsToTransfer = bidPrice.sub(fees);

        expect(finalFeeRecipientBalance).to.equal(initialFeeRecipientBalance.add(fees));
        expect(finalSellerBalance).to.equal(initialSellerBalance.add(expectedFundsToTransfer).sub(receipt.effectiveGasPrice.mul(receipt.gasUsed)));
      });

      it("should remove the listing from listings", async () => {
        await subject();

        const listing = await exchange.listings(listingId);
        expect(listing.seller).to.equal(ethers.constants.AddressZero);
      });

      it("should remove the bid from bids", async () => {
        await subject();

        const bid = await exchange.bids(bidId);
        expect(bid.buyer).to.equal(ethers.constants.AddressZero);
      });

      it("should remove the listing from userListings", async () => {
        await subject();

        const sellerBids = await exchange.getUserListings(seller.address);
        expect(sellerBids.length).to.equal(0);
      });

      it("should remove the bid from userBids", async () => {
        await subject();

        const buyerBids = await exchange.getUserBids(buyer.address);
        expect(buyerBids.length).to.equal(0);
      });

      it("should emit a SaleFinalized event", async () => {
        const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
        await expect(subject()).to.emit(exchange, "SaleFinalized").withArgs(
          bidId,
          listingId,
          bidPrice.sub(fees),
          fees
        );
      });

      it("should update domain ownership on registry ", async () => {
        const sellerDomainsBefore = await verifiedDomainRegistry.getUserDomains(seller.address);
        const buyerDomainsBefore = await verifiedDomainRegistry.getUserDomains(buyer.address);

        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomain(domainId2);

        const sellerDomainsAfter = await verifiedDomainRegistry.getUserDomains(seller.address);
        const buyerDomainsAfter = await verifiedDomainRegistry.getUserDomains(buyer.address);
        const buyerDomainIds = buyerDomainsAfter.map(domain => domain.domainId);

        expect(domainInfo.domain.owner).to.equal(buyer.address);
        expect(sellerDomainsAfter.length).to.equal(sellerDomainsBefore.length - 1);
        expect(buyerDomainsAfter.length).to.equal(buyerDomainsBefore.length + 1);
        expect(buyerDomainIds).to.include(domainId2);
      });

      it("should remove domain exchange and listing on registry", async () => {
        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomain(domainId2);
        expect(domainInfo.domain.exchange).to.equal(ZERO);
        expect(domainInfo.domain.listingId).to.equal(ZERO);
      });

      describe("when the sale eth recipient is not the seller address", async () => {
        beforeEach(async () => {
          await exchange.connect(seller.wallet).updateListing(listingId, ether(5), sellerSaleEthRecipient.address);
        });

        it("should transfer funds to the seller and fee recipient", async () => {
          const initialSellerBalance = await provider.getBalance(seller.address);
          const initialSellerEthRecipientBalance = await provider.getBalance(sellerSaleEthRecipient.address);
          const initialFeeRecipientBalance = await provider.getBalance(feeRecipient.address);

          const tx = await subject();
          const receipt = await tx.wait();

          const finalSellerBalance = await provider.getBalance(seller.address);
          const finalSellerEthRecipientBalance = await provider.getBalance(sellerSaleEthRecipient.address);
          const finalFeeRecipientBalance = await provider.getBalance(feeRecipient.address);

          const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
          const expectedFundsToTransfer = bidPrice.sub(fees);
          const expectedGasFeePaid = receipt.effectiveGasPrice.mul(receipt.gasUsed);

          expect(initialSellerBalance).to.equal(finalSellerBalance.add(expectedGasFeePaid));
          expect(finalFeeRecipientBalance).to.equal(initialFeeRecipientBalance.add(fees));
          expect(finalSellerEthRecipientBalance).to.equal(initialSellerEthRecipientBalance.add(expectedFundsToTransfer));
        });
      });

      describe("when there are multiple bids against the listing", async () => {
        beforeEach(async () => {
          // Create another bid against groth16.xyz
          await exchange.connect(otherBuyer.wallet).createBid(
            listingId,
            hashedBuyerId,
            encryptedBuyerId,
            {
              value: bidPrice
            }
          );
        });

        it("should not delete the listing", async () => {
          await subject();

          const listing = await exchange.listings(listingId);
          expect(listing.seller).to.equal(seller.address);
        });

        it("should mark the listing as expired", async () => {
          await subject();

          const listing = await exchange.listings(listingId);
          expect(listing.isActive).to.be.false;
        });
      });

      describe("when selected bid has already initiated refund", async () => {
        beforeEach(async () => {
          // Pass blockchain time to bypass minBidActive period
          await blockchain.increaseTimeAsync(bidRefundPeriod.add(1).toNumber());
          await exchange.connect(buyer.wallet).initiateRefund(bidId);

          subjectProof = generateTransferProof(dkimKeyHash, hashedBuyerId, bidId);
        });

        it("should still finalize the sale", async () => {
          expect(await subject()).to.not.be.reverted;
        });

        it("should emit SaleFinalized event", async () => {
          const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
          await expect(subject()).to.emit(exchange, "SaleFinalized").withArgs(
            bidId,
            listingId,
            bidPrice.sub(fees),
            fees
          );
        });
      });

      describe("when selected bid does not exist", async () => {
        beforeEach(async () => {
          // pass time to mark bid as expired and then withdraw bid
          await blockchain.increaseTimeAsync(bidSettlementPeriod.add(1).toNumber());
          await exchange.connect(buyer.wallet).initiateRefund(bidId);
          await blockchain.increaseTimeAsync(bidRefundPeriod.add(1).toNumber());
          await exchange.connect(buyer.wallet).withdrawBid(bidId);

          subjectProof = generateTransferProof(dkimKeyHash, hashedBuyerId, bidId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Bid does not exist");
        });
      });

      describe("when owner has set a custom DKIM key hash", async () => {
        let customDkimKeyHash: BytesLike;

        beforeEach(async () => {
          if (shouldInitialize) {
            customDkimKeyHash = ethers.utils.hexlify(ethers.utils.randomBytes(32));
            await exchange.connect(seller.wallet).createListing(
              domainId1,
              ether(1),
              ether(0.5),
              seller.address,
              sellerEncryptionKey,
              customDkimKeyHash
            );
            listingId = (await exchange.listingCounter()).sub(1);

            // Create a bid against groth16.xyz
            bidPrice = ether(2);
            hashedBuyerId = getHashedBuyerId("buyerId");
            await exchange.connect(buyer.wallet).createBid(
              listingId,
              hashedBuyerId,
              encryptedBuyerId,
              {
                value: bidPrice
              }
            );
            bidId = (await exchange.bidCounter()).sub(1);

            await xferDomainProcessor.setDomainName("0xsachink.xyz");   // Set domain name in mock
            proof = generateTransferProof(customDkimKeyHash, hashedBuyerId, bidId);
          }

          subjectProof = generateTransferProof(customDkimKeyHash, hashedBuyerId, bidId);
        });

        it("should finalize the sale", async () => {
          await expect(subject()).to.not.be.reverted;
        });

        it("should emit a SaleFinalized event", async () => {
          const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
          await expect(subject()).to.emit(exchange, "SaleFinalized").withArgs(
            bidId,
            listingId,
            bidPrice.sub(fees),
            fees
          );
        });

        describe("when the dkim key hash is incorrect", async () => {
          beforeEach(async () => {
            const incorrectDkimKeyHash = ethers.utils.hexlify(ethers.utils.randomBytes(32));
            subjectProof = generateTransferProof(incorrectDkimKeyHash, hashedBuyerId, bidId);
          });

          it("should revert", async () => {
            await expect(subject()).to.be.revertedWith("Invalid custom DKIM key hash");
          });
        });
      });

      describe("when the dkim key hash is incorrect", async () => {
        beforeEach(async () => {
          const incorrectDkimKeyHash = ethers.utils.hexlify(ethers.utils.randomBytes(32));
          subjectProof = generateTransferProof(incorrectDkimKeyHash, hashedBuyerId, bidId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Invalid managed DKIM key hash");
        });
      });

      describe("when the owner updates the domain after creating a listing", async () => {
        let newExpiryTimestamp: string;
        beforeEach(async () => {
          newExpiryTimestamp = '2035-07-08T18:22:00';
          if (shouldInitialize) {
            let proofs = generateProofsFromDomains([
              {
                name: domainName2,
                expiryTimestamp: newExpiryTimestamp,
              }
            ]);
            await verifiedDomainRegistry.connect(seller.wallet).verifyDomains(proofs);
          }
        });

        it("should still finalize the sale", async () => {
          // assert domain info has been updated
          const domainInfo = await verifiedDomainRegistry.getDomains([domainId2]);
          expect(domainInfo[0].domain.expiryTime).to.equal(convertToUnixTimestamp(newExpiryTimestamp));

          await expect(subject()).to.not.be.reverted;
        });

        it("should emit SaleFinalized event with the correct domain id", async () => {
          const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
          await expect(subject()).to.emit(exchange, "SaleFinalized").withArgs(
            bidId,
            listingId,
            bidPrice.sub(fees),
            fees
          );
        });
      });

      describe("caller is not seller", async () => {
        beforeEach(async () => {
          subjectCaller = otherSeller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not listing owner");
        });
      });

      describe("when listing is not active", async () => {
        beforeEach(async () => {
          await exchange.connect(seller.wallet).deleteListing(listingId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Listing not active");
        });
      });

      describe("hashed receiver ID is invalid", async () => {
        beforeEach(async () => {
          let invalidBuyerId = getHashedBuyerId("invalidBuyerId");
          subjectProof = generateTransferProof(dkimKeyHash, invalidBuyerId, bidId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Invalid receiver");
        });
      });

      describe("domain name doesn't match the listing", async () => {
        beforeEach(async () => {
          await xferDomainProcessor.setDomainName("invalid.domain");
          subjectProof = generateTransferProof(dkimKeyHash, hashedBuyerId, bidId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Invalid domain");
        });
      });

      describe("when seller tries to finalize sale twice", async () => {
        beforeEach(async () => {
          // Other buyer creates a bid
          await exchange.connect(otherBuyer.wallet).createBid(
            listingId,
            hashedBuyerId,
            encryptedBuyerId,
            {
              value: ether(5)
            }
          );
          otherBidId = (await exchange.bidCounter()).sub(1);

          // Seller finalizes the sale on first bid
          await subject();

          // Buyer colludes with the seller and transfers the domain back to the seller

          // Generates a transfer proof
          let proof = generateTransferProof(dkimKeyHash, hashedBuyerId, otherBidId);

          subjectCaller = seller;
          subjectProof = proof;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Listing not active");
        });
      });

      describe("when the exchange is paused", async () => {
        beforeEach(async () => {
          await exchange.connect(owner.wallet).pauseMarketplace();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Pausable: paused");
        });

        describe("when the exchange is unpaused", async () => {
          beforeEach(async () => {
            await exchange.connect(owner.wallet).unpauseMarketplace();
          });

          it("should not revert", async () => {
            await expect(subject()).to.not.be.reverted;
          });
        });
      });

      describe("when the contract is not initialized", async () => {
        before(async () => {
          shouldInitialize = false;
        });

        after(async () => {
          shouldInitialize = true;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Contract must be initialized");
        });
      });
    });

    describe("#buyerReleaseFunds", async () => {
      let subjectBidId: BigNumber;
      let subjectCaller: Account;

      let bidId: BigNumber;
      let listingId: BigNumber;
      let hashedBuyerId: BytesLike;
      let bidPrice: BigNumber;

      beforeEach(async () => {
        // create a listing
        await exchange.connect(seller.wallet).createListing(
          domainId2,
          ether(5),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        // create a bid
        hashedBuyerId = getHashedBuyerId("buyerId");
        bidPrice = ether(6);
        await exchange.connect(buyer.wallet).createBid(
          listingId,
          hashedBuyerId,
          encryptedBuyerId,
          {
            value: bidPrice
          }
        );
        bidId = (await exchange.bidCounter()).sub(1);

        subjectBidId = bidId;
        subjectCaller = buyer;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).buyerReleaseFunds(subjectBidId);
      }

      it("should release funds to the seller", async () => {
        const sellerBalanceBefore = await provider.getBalance(seller.address);

        await subject();

        const sellerBalanceAfter = await provider.getBalance(seller.address);

        const expectedTransfer = bidPrice.mul(ether(1).sub(await exchange.fee())).div(ether(1));
        expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(expectedTransfer);
      });

      it("should transfer fee to the fee recipient", async () => {
        const feeRecipientBalanceBefore = await provider.getBalance(await exchange.feeRecipient());
        await subject();
        const feeRecipientBalanceAfter = await provider.getBalance(await exchange.feeRecipient());

        const expectedFee = bidPrice.mul(await exchange.fee()).div(ether(1));
        expect(feeRecipientBalanceAfter.sub(feeRecipientBalanceBefore)).to.equal(expectedFee);
      });

      it("should remove the listing from listings", async () => {
        await subject();

        const listing = await exchange.listings(listingId);
        expect(listing.seller).to.equal(ethers.constants.AddressZero);
      });

      it("should remove the bid from bids", async () => {
        await subject();

        const bid = await exchange.bids(bidId);
        expect(bid.buyer).to.equal(ethers.constants.AddressZero);
      });

      it("should remove the listing from userListings", async () => {
        await subject();

        const sellerBids = await exchange.getUserListings(seller.address);
        expect(sellerBids.length).to.equal(0);
      });

      it("should remove the bid from userBids", async () => {
        await subject();

        const buyerBids = await exchange.getUserBids(buyer.address);
        expect(buyerBids.length).to.equal(0);
      });


      it("should emit a SaleFinalized event", async () => {
        const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
        await expect(subject()).to.emit(exchange, "SaleFinalized").withArgs(
          bidId,
          listingId,
          bidPrice.sub(fees),
          fees
        );
      });

      it("should update domain ownership on registry", async () => {
        const sellerDomainsBefore = await verifiedDomainRegistry.getUserDomains(seller.address);
        const buyerDomainsBefore = await verifiedDomainRegistry.getUserDomains(buyer.address);

        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomain(domainId2);

        const sellerDomainsAfter = await verifiedDomainRegistry.getUserDomains(seller.address);
        const buyerDomainsAfter = await verifiedDomainRegistry.getUserDomains(buyer.address);
        const buyerDomainIds = buyerDomainsAfter.map(domain => domain.domainId);


        expect(domainInfo.domain.owner).to.equal(buyer.address);
        expect(sellerDomainsAfter.length).to.equal(sellerDomainsBefore.length - 1);
        expect(buyerDomainsAfter.length).to.equal(buyerDomainsBefore.length + 1);
        expect(buyerDomainIds).to.include(domainId2);
      });

      it("should remove domain exchange and listing id on registry", async () => {
        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomain(domainId2);
        expect(domainInfo.domain.exchange).to.equal(ZERO);
        expect(domainInfo.domain.listingId).to.equal(ZERO);
      });

      describe("when the sale eth recipient is not the seller address", async () => {
        beforeEach(async () => {
          await exchange.connect(seller.wallet).updateListing(listingId, ether(5), sellerSaleEthRecipient.address);
        });

        it("should transfer funds to the seller and fee recipient", async () => {
          const initialSellerBalance = await provider.getBalance(seller.address);
          const initialSellerEthRecipientBalance = await provider.getBalance(sellerSaleEthRecipient.address);
          const initialFeeRecipientBalance = await provider.getBalance(feeRecipient.address);

          await subject();

          const finalSellerBalance = await provider.getBalance(seller.address);
          const finalSellerEthRecipientBalance = await provider.getBalance(sellerSaleEthRecipient.address);
          const finalFeeRecipientBalance = await provider.getBalance(feeRecipient.address);

          const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
          const expectedFundsToTransfer = bidPrice.sub(fees);

          expect(initialSellerBalance).to.equal(finalSellerBalance);    // Transaction was initiated by buyer
          expect(finalFeeRecipientBalance).to.equal(initialFeeRecipientBalance.add(fees));
          expect(finalSellerEthRecipientBalance).to.equal(initialSellerEthRecipientBalance.add(expectedFundsToTransfer));
        });
      });

      describe("when the caller is not the buyer", async () => {
        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not bid owner");
        });
      });

      describe("when the listing is not active", async () => {
        beforeEach(async () => {
          await exchange.connect(seller.wallet).deleteListing(listingId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Listing not active");
        });
      });

      describe("when the selected bid has initiated refund", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(bidRefundPeriod.add(1).toNumber());
          await exchange.connect(buyer.wallet).initiateRefund(subjectBidId);
        });

        it("should not revert", async () => {
          await expect(subject()).to.not.be.reverted;
        });

        it("should emit SaleFinalized event", async () => {
          const fees = bidPrice.mul(swapFee).div(PRECISE_UNIT);
          await expect(subject()).to.emit(exchange, "SaleFinalized").withArgs(
            subjectBidId,
            listingId,
            bidPrice.sub(fees),
            fees
          );
        });
      });
    });

    describe("#enableInstantAccept", async () => {
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectCaller = buyer;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).enableInstantAccept();
      }

      it("should enable instant accept", async () => {
        await subject();

        const instantAcceptEnabled = await exchange.instantAcceptEnabled(subjectCaller.address);
        expect(instantAcceptEnabled).to.be.true;
      });

      it("should emit an InstantAcceptUpdated event", async () => {
        await expect(subject()).to.emit(exchange, "InstantAcceptUpdated").withArgs(subjectCaller.address, true);
      });

      describe("when instant accept is already enabled", async () => {
        beforeEach(async () => {
          await exchange.connect(subjectCaller.wallet).enableInstantAccept();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Instant accept already enabled");
        });
      });
    });

    describe("#disableInstantAccept", async () => {
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectCaller = buyer;
        await exchange.connect(subjectCaller.wallet).enableInstantAccept();
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).disableInstantAccept();
      }

      it("should disable instant accept", async () => {
        await subject();

        const instantAcceptEnabled = await exchange.instantAcceptEnabled(subjectCaller.address);
        expect(instantAcceptEnabled).to.be.false;
      });

      it("should emit an InstantAcceptUpdated event", async () => {
        await expect(subject()).to.emit(exchange, "InstantAcceptUpdated").withArgs(subjectCaller.address, false);
      });

      describe("when instant accept is already disabled", async () => {
        beforeEach(async () => {
          await exchange.connect(subjectCaller.wallet).disableInstantAccept();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Instant accept already disabled");
        });
      });
    });

    /* ============== Registry Functions (Integration Test) ============== */

    describe("#registryRemoveListing", async () => {
      let listingId: BigNumber;
      let otherSellerProofs: ReclaimProof[];

      beforeEach(async () => {
        // seller claims ownership of the domain
        let domains = [
          {
            name: '0xsachink.xyz',
            expiryTimestamp: '2025-07-08T07:01:00',
          } as Domain,
        ];
        let proofs = generateProofsFromDomains(domains);
        await verifiedDomainRegistry.connect(seller.wallet).verifyDomains(proofs);

        // seller lists the domain
        await exchange.connect(seller.wallet).createListing(
          domainId1,
          ether(5),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        otherSellerProofs = generateProofsFromDomains([{
          name: '0xsachink.xyz',
          expiryTimestamp: '2025-07-08T07:01:00',
        }]);
      });

      async function subject(): Promise<any> {
        // Invokes registryRemoveListing
        return await verifiedDomainRegistry.connect(otherSeller.wallet).verifyDomains(otherSellerProofs);
      }

      it("should delete the listing", async () => {
        await subject();

        const oldListing = await exchange.listings(listingId);
        expect(oldListing.seller).to.equal(ADDRESS_ZERO);
      });

      it("should mark the listing as expired", async () => {
        await subject();

        const oldListing = await exchange.listings(listingId);
        expect(oldListing.isActive).to.be.false;
      });

      it("should remove old listing from previous seller's listings", async () => {
        await subject();

        const oldSellerListings = await exchange.getUserListings(seller.address);
        expect(oldSellerListings.length).to.equal(0);
      });

      it("should emit ListingDeletedByRegistry event", async () => {
        await expect(subject()).to.emit(exchange, "ListingDeletedByRegistry").withArgs(
          listingId
        );
      });

      describe("when there are bids against the existing listing", async () => {
        beforeEach(async () => {
          await exchange.connect(buyer.wallet).createBid(
            listingId,
            getHashedBuyerId("richardliang2015"),
            encryptedBuyerId,
            {
              value: ether(6)
            }
          );
        });

        it("should not delete the listing", async () => {
          await subject();

          const oldListing = await exchange.listings(listingId);
          expect(oldListing.seller).to.equal(seller.address);
        });

        it("should mark old listing as expired", async () => {
          await subject();

          const oldListing = await exchange.listings(listingId);
          expect(oldListing.isActive).to.be.false;
        });

        it("should remove old listing from previous seller's listings", async () => {
          await subject();

          const oldSellerListings = await exchange.getUserListings(seller.address);
          expect(oldSellerListings.length).to.equal(0);
        });

        it("should emit ListingDeletedByRegistry event", async () => {
          await expect(subject()).to.emit(exchange, "ListingDeletedByRegistry").withArgs(
            listingId
          );
        });
      });

      describe("when caller is not registry", async () => {
        let subjectCaller: Account;

        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        async function subject(): Promise<any> {
          return exchange.connect(subjectCaller.wallet).registryRemoveListing(listingId);
        }

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller is not registry");
        });
      });

      describe("when listing is NOT active", async () => {
        beforeEach(async () => {
          // original seller deletes the listing the before hand
          await exchange.connect(seller.wallet).deleteListing(listingId);
        });

        it("should NOT revert", async () => {
          await expect(subject()).to.not.be.reverted;
        });
      });
    });

    /* ============== Admin Functions ============== */


    describe("#updateFee", async () => {
      let subjectNewFee: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectNewFee = ether(0.1);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).updateFee(subjectNewFee);
      }

      it("should update the fee", async () => {
        await subject();

        const newFee = await exchange.fee();
        expect(newFee).to.equal(subjectNewFee);
      });

      it("should emit a FeeUpdated event", async () => {
        await expect(subject()).to.emit(exchange, "FeeUpdated").withArgs(subjectNewFee);
      });

      describe("when new fee is zero", async () => {
        beforeEach(async () => {
          subjectNewFee = ZERO;
        });

        it("should set fee to zero", async () => {
          await subject();

          const newFee = await exchange.fee();
          expect(newFee).to.equal(ZERO);
        });
      });

      describe("when caller is not admin", async () => {
        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#updateFeeRecipient", async () => {
      let subjectNewFeeRecipient: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectNewFeeRecipient = otherBuyer.address;
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).updateFeeRecipient(subjectNewFeeRecipient);
      }

      it("should update the fee recipient", async () => {
        await subject();

        const newFeeRecipient = await exchange.feeRecipient();
        expect(newFeeRecipient).to.equal(subjectNewFeeRecipient);
      });

      it("should emit a FeeRecipientUpdated event", async () => {
        await expect(subject()).to.emit(exchange, "FeeRecipientUpdated").withArgs(subjectNewFeeRecipient);
      });

      describe("when new fee recipient is the zero address", async () => {
        beforeEach(async () => {
          subjectNewFeeRecipient = ADDRESS_ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Invalid address");
        });
      });

      describe("when caller is not admin", async () => {
        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#updateBidSettlementPeriod", async () => {
      let subjectNewBidSettlementPeriod: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectNewBidSettlementPeriod = ONE_DAY_IN_SECONDS.mul(2);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).updateBidSettlementPeriod(subjectNewBidSettlementPeriod);
      }

      it("should update the bid settlement period", async () => {
        await subject();

        const newBidSettlementPeriod = await exchange.bidSettlementPeriod();
        expect(newBidSettlementPeriod).to.equal(subjectNewBidSettlementPeriod);
      });

      it("should emit a BidSettlementPeriodUpdated event", async () => {
        await expect(subject()).to.emit(exchange, "BidSettlementPeriodUpdated").withArgs(subjectNewBidSettlementPeriod);
      });

      describe("when new bid settlement period is zero", async () => {
        beforeEach(async () => {
          subjectNewBidSettlementPeriod = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Bid settlement period must be greater than 0");
        });
      });

      describe("when caller is not admin", async () => {
        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#updateBidRefundPeriod", async () => {
      let subjectNewBidRefundPeriod: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectNewBidRefundPeriod = ONE_DAY_IN_SECONDS.mul(3);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return exchange.connect(subjectCaller.wallet).updateBidRefundPeriod(subjectNewBidRefundPeriod);
      }

      it("should update the bid refund period", async () => {
        await subject();

        const newBidRefundPeriod = await exchange.bidRefundPeriod();
        expect(newBidRefundPeriod).to.equal(subjectNewBidRefundPeriod);
      });

      it("should emit a BidRefundPeriodUpdated event", async () => {
        await expect(subject()).to.emit(exchange, "BidRefundPeriodUpdated").withArgs(subjectNewBidRefundPeriod);
      });

      describe("when new bid refund period is zero", async () => {
        beforeEach(async () => {
          subjectNewBidRefundPeriod = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Bid refund period must be greater than 0");
        });
      });

      describe("when caller is not admin", async () => {
        beforeEach(async () => {
          subjectCaller = otherBuyer;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    /* ============== View Functions ============== */

    describe("#getUserListings", () => {
      let subjectUser: string;

      beforeEach(async () => {
        // Create listings for the domains
        await exchange.connect(seller.wallet).createListing(
          domainId1,
          ether(1),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        await exchange.connect(seller.wallet).createListing(
          domainId2,
          ether(5),
          ether(0.6),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );

        subjectUser = seller.address;
      });

      async function subject(): Promise<any> {
        return exchange.getUserListings(subjectUser);
      }

      it("should return the correct listings for the user", async () => {

        const userListings = await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const listingCounter = await exchange.listingCounter();

        expect(userListings.length).to.equal(2);
        expect(userListings[0].listingId).to.equal(listingCounter.sub(2));
        expect(userListings[0].listing.askPrice).to.equal(ether(1));
        expect(userListings[0].listing.minBidPrice).to.equal(ether(0.5));
        expect(userListings[0].listing.seller).to.equal(seller.address);
        expect(userListings[0].listing.createdAt).to.approximately(currentTimestamp, 1);

        expect(userListings[1].listingId).to.equal(listingCounter.sub(1));
        expect(userListings[1].listing.askPrice).to.equal(ether(5));
        expect(userListings[1].listing.minBidPrice).to.equal(ether(0.6));
        expect(userListings[1].listing.seller).to.equal(seller.address);
        expect(userListings[1].listing.createdAt).to.equal(currentTimestamp);
      });

      describe("when the user has no listings", () => {
        beforeEach(() => {
          subjectUser = buyer.address;
        });

        it("should return an empty array", async () => {
          const userListings = await subject();

          expect(userListings.length).to.equal(0);
        });
      });
    });

    describe("#getUserBids", () => {
      let subjectUser: Address;

      let bidId: BigNumber;
      let listingId: BigNumber;

      beforeEach(async () => {
        // Create listings
        await exchange.connect(seller.wallet).createListing(
          domainId1,
          ether(1),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        // Create a bid against groth16.xyz
        await exchange.connect(buyer.wallet).enableInstantAccept();
        await exchange.connect(buyer.wallet).createBid(
          listingId,
          getHashedBuyerId("buyerId"),
          encryptedBuyerId,
          {
            value: ether(1)
          }
        );

        bidId = (await exchange.bidCounter()).sub(1);

        subjectUser = buyer.address;
      });

      async function subject(): Promise<any[]> {
        return exchange.getUserBids(subjectUser);
      }

      it("should return the correct bids for the user", async () => {
        const userBids = await subject();

        expect(userBids.length).to.equal(1);
        expect(userBids[0].bidId).to.equal(bidId);
        expect(userBids[0].bid.price).to.equal(ether(1));
        expect(userBids[0].bid.buyer).to.equal(buyer.address);
        expect(userBids[0].bid.listingId).to.equal(listingId);
        expect(userBids[0].bid.createdAt).to.equal(await blockchain.getCurrentTimestamp());
        expect(userBids[0].buyerInstantAcceptEnabled).to.be.true;
      });

      describe("when the user has no bids", () => {
        beforeEach(() => {
          subjectUser = otherBuyer.address;
        });

        it("should return an empty array", async () => {
          const userBids = await subject();

          expect(userBids.length).to.equal(0);
        });
      });
    });

    describe("#getListingBids", () => {
      let subjectListingId: BigNumber[];

      let bidId1: BigNumber;
      let bidId2: BigNumber;
      let listingId: BigNumber;

      beforeEach(async () => {
        // Create a listing
        await exchange.connect(seller.wallet).createListing(
          domainId1,
          ether(1),
          ether(0.5),
          seller.address,
          sellerEncryptionKey,
          ethers.constants.HashZero
        );
        listingId = (await exchange.listingCounter()).sub(1);

        // Create two bids against the listing
        await exchange.connect(buyer.wallet).enableInstantAccept();
        await exchange.connect(buyer.wallet).createBid(
          listingId,
          getHashedBuyerId("buyerId1"),
          encryptedBuyerId,
          {
            value: ether(1)
          }
        );

        await exchange.connect(otherBuyer.wallet).createBid(
          listingId,
          getHashedBuyerId("buyerId2"),
          encryptedBuyerId,
          {
            value: ether(2)
          }
        );

        bidId1 = (await exchange.bidCounter()).sub(2);
        bidId2 = (await exchange.bidCounter()).sub(1);

        subjectListingId = [listingId];
      });

      async function subject(): Promise<any[]> {
        return exchange.getListingBids(subjectListingId);
      }

      it("should return the correct bids for the listing", async () => {
        const listingBids = await subject();

        expect(listingBids.length).to.equal(1);
        expect(listingBids[0].length).to.equal(2);
        expect(listingBids[0][0].bidId).to.equal(bidId1);
        expect(listingBids[0][0].bid.price).to.equal(ether(1));
        expect(listingBids[0][0].bid.buyer).to.equal(buyer.address);
        expect(listingBids[0][0].bid.createdAt).to.approximately(await blockchain.getCurrentTimestamp(), 1);
        expect(listingBids[0][0].buyerInstantAcceptEnabled).to.be.true;

        expect(listingBids[0][1].bidId).to.equal(bidId2);
        expect(listingBids[0][1].bid.price).to.equal(ether(2));
        expect(listingBids[0][1].bid.buyer).to.equal(otherBuyer.address);
        expect(listingBids[0][1].bid.createdAt).to.equal(await blockchain.getCurrentTimestamp());
        expect(listingBids[0][1].buyerInstantAcceptEnabled).to.be.false;
      });

      describe("when the listing has no bids", () => {
        beforeEach(async () => {
          // Create a new listing without bids
          await exchange.connect(seller.wallet).createListing(
            domainId2,
            ether(5),
            ether(0.5),
            seller.address,
            sellerEncryptionKey,
            ethers.constants.HashZero
          );
          listingId = (await exchange.listingCounter()).sub(1);

          subjectListingId = [listingId];
        });

        it("should return an empty array", async () => {
          const listingBids = await subject();

          expect(listingBids[0].length).to.equal(0);
        });
      });

      describe("when the listing does not exist", () => {
        beforeEach(() => {
          subjectListingId = [listingId.add(1)];
        });

        it("should return an empty array", async () => {
          const listingBids = await subject();

          expect(listingBids[0].length).to.equal(0);
        });
      });
    });
  });

  describe("#updateTransferDomainProcessor", async () => {
    let subjectNewTransferDomainProcessor: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectNewTransferDomainProcessor = newTransferDomainProcessor.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await exchange.connect(subjectCaller.wallet).updateTransferDomainProcessor(subjectNewTransferDomainProcessor);
    }

    it("should update the transfer domain processor", async () => {
      await subject();

      const newProcessor = await exchange.transferDomainProcessor();
      expect(newProcessor).to.equal(subjectNewTransferDomainProcessor);
    });

    it("should emit a TransferDomainProcessorUpdated event", async () => {
      await expect(subject()).to.emit(exchange, "TransferDomainProcessorUpdated").withArgs(subjectNewTransferDomainProcessor);
    });

    describe("when the caller is not the owner", () => {
      beforeEach(async () => {
        subjectCaller = seller;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when the new processor address is zero", () => {
      beforeEach(async () => {
        subjectNewTransferDomainProcessor = ADDRESS_ZERO;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid address");
      });
    });
  });

  describe("#updateMailServerKeyHashAdapter", async () => {
    let subjectNewMailServerKeyHashAdapter: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;
      subjectNewMailServerKeyHashAdapter = newMailServerKeyHashAdapter.address;
    });

    async function subject(): Promise<any> {
      return await exchange.connect(subjectCaller.wallet).updateMailServerKeyHashAdapter(subjectNewMailServerKeyHashAdapter);
    }

    it("should update the mail server key hash adapter", async () => {
      await subject();

      const newAdapter = await exchange.mailServerKeyHashAdapter();
      expect(newAdapter).to.equal(subjectNewMailServerKeyHashAdapter);
    });

    it("should emit a MailServerKeyHashAdapterUpdated event", async () => {
      await expect(subject()).to.emit(exchange, "MailServerKeyHashAdapterUpdated").withArgs(subjectNewMailServerKeyHashAdapter);
    });

    describe("when the caller is not the owner", () => {
      beforeEach(async () => {
        subjectCaller = seller;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when the new adapter address is zero", () => {
      beforeEach(async () => {
        subjectNewMailServerKeyHashAdapter = ADDRESS_ZERO;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid address");
      });
    });
  });
});