
import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber, Bytes, BytesLike } from "ethers";

import { Account } from "@utils/test/types";
import { Domain } from "@utils/types";
import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

import DeployHelper from "@utils/deploys";
import { Address } from "@utils/types";
import { ADDRESS_ZERO, ONE, ONE_DAY_IN_SECONDS, ZERO } from "@utils/constants";
import {
  calculateDomainId,
  convertToUnixTimestamp,
  generateProofsFromDomains,
  convertUnixTimestampToDateString
} from "@utils/protocolUtils";
import {
  IProxyBaseProcessor,
  VerifiedDomainRegistry,
  VerifyDomainProcessorMock,
  DomainExchangeMock
} from "@utils/contracts";
import { Blockchain, ether, usdc } from "@utils/common";

const expect = getWaffleExpect();
const blockchain = new Blockchain(ethers.provider);

describe("VerifiedDomainRegistry", () => {
  let owner: Account;
  let seller: Account;
  let otherSeller: Account;

  let verifiedDomainRegistry: VerifiedDomainRegistry;
  let verifyDomainProcessor: VerifyDomainProcessorMock;
  let newVerifyDomainProcessor: VerifyDomainProcessorMock;

  let snapshotId: string;
  let deployer: DeployHelper;

  let exchange: Account;
  let secondExchange: Account;
  let domainExchangeMock: DomainExchangeMock;

  before(async () => {
    [
      owner,
      seller,
      otherSeller,
      exchange,
      secondExchange
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    verifyDomainProcessor = await deployer.deployVerifyDomainProcessorMock();
    newVerifyDomainProcessor = await deployer.deployVerifyDomainProcessorMock();
    verifiedDomainRegistry = await deployer.deployVerifiedDomainRegistry();

    domainExchangeMock = await deployer.deployDomainExchangeMock(verifiedDomainRegistry.address);
  });

  beforeEach(async () => {
    snapshotId = await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertByIdAsync(snapshotId);
  });

  describe("#constructor", async () => {
    it("should set the correct parameters", async () => {
      expect(await verifiedDomainRegistry.owner()).to.equal(owner.address);
      expect(await verifiedDomainRegistry.isInitialized()).to.equal(false);
    });
  });

  describe("#initialize", async () => {
    let subjectVerifyDomainProcessor: Address;

    beforeEach(async () => {
      subjectVerifyDomainProcessor = verifyDomainProcessor.address;
    });

    async function subject(): Promise<any> {
      return verifiedDomainRegistry.initialize(subjectVerifyDomainProcessor);
    }

    it("should set the correct parameters", async () => {
      await subject();

      expect(await verifiedDomainRegistry.isInitialized()).to.equal(true);
    });

    it("should set initialize to true", async () => {
      await subject();

      expect(await verifiedDomainRegistry.isInitialized()).to.equal(true);
    });

    it("should emit VerifyDomainProcessorUpdated event", async () => {
      await expect(subject()).to.emit(verifiedDomainRegistry, "VerifyDomainProcessorUpdated").withArgs(
        subjectVerifyDomainProcessor
      );
    });

    describe("if already initialized", () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Already initialized");
      });
    });
  });

  describe("when it is initialized", async () => {
    let snapshotIdTwo: string;
    let shouldInitialize: boolean = true;

    beforeEach(async () => {
      if (shouldInitialize) {
        await verifiedDomainRegistry.initialize(verifyDomainProcessor.address);
      }
      snapshotIdTwo = await blockchain.saveSnapshotAsync();
    });

    afterEach(async () => {
      await blockchain.revertByIdAsync(snapshotIdTwo);
    });

    describe("#verifyDomains", async () => {
      let subjectCaller: Account;
      let subjectProofs: IProxyBaseProcessor.ProofStruct[];

      let domainName: string;
      let expiryTimestamp: string;
      let domainId: string;

      beforeEach(async () => {
        domainName = 'groth16.xyz';
        expiryTimestamp = '2025-07-08T18:22:00';
        domainId = calculateDomainId(domainName);

        subjectCaller = seller;
        subjectProofs = generateProofsFromDomains([
          {
            name: domainName,
            expiryTimestamp: expiryTimestamp,
          }
        ]);
      });

      async function subject(): Promise<any> {
        return verifiedDomainRegistry.connect(subjectCaller.wallet).verifyDomains(subjectProofs);
      }

      it("should update domain info", async () => {
        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomains([domainId]);
        expect(domainInfo[0].domainId).to.equal(domainId);
        expect(domainInfo[0].domain.owner).to.equal(seller.address);
        expect(domainInfo[0].domain.name).to.equal(domainName);
        expect(domainInfo[0].domain.expiryTime).to.equal(convertToUnixTimestamp(expiryTimestamp));
        expect(domainInfo[0].domain.exchange).to.equal(ADDRESS_ZERO);
        expect(domainInfo[0].domain.listingId).to.equal(0);
      });

      it("should update userDomains", async () => {
        await subject();

        const userDomains = await verifiedDomainRegistry.getUserDomains(seller.address);
        expect(userDomains.length).to.equal(1);
        expect(userDomains[0].domainId).to.equal(domainId);
      });

      it("should emit DomainVerified event", async () => {
        await expect(subject()).to.emit(verifiedDomainRegistry, "DomainVerified").withArgs(
          domainId,
          seller.address,
          domainName,
          convertToUnixTimestamp(expiryTimestamp)
        );
      });

      describe("when verifying multiple domains", () => {
        let secondDomainName: string;
        let secondExpiryTimestamp: string;
        let secondDomainId: string;

        beforeEach(async () => {
          secondDomainName = '0xsachink.xyz';
          secondExpiryTimestamp = '2025-07-08T07:01:00';
          secondDomainId = calculateDomainId(secondDomainName);

          subjectProofs = generateProofsFromDomains([
            {
              name: domainName,
              expiryTimestamp: expiryTimestamp,
            },
            {
              name: secondDomainName,
              expiryTimestamp: secondExpiryTimestamp,
            }
          ]);
        });

        it("should update domain info for both domains", async () => {
          await subject();

          const domainInfo = await verifiedDomainRegistry.getDomains([domainId, secondDomainId]);

          expect(domainInfo[0].domainId).to.equal(domainId);
          expect(domainInfo[0].domain.owner).to.equal(seller.address);
          expect(domainInfo[0].domain.name).to.equal(domainName);
          expect(domainInfo[0].domain.expiryTime).to.equal(convertToUnixTimestamp(expiryTimestamp));
          expect(domainInfo[0].domain.exchange).to.equal(ADDRESS_ZERO);
          expect(domainInfo[0].domain.listingId).to.equal(0);

          expect(domainInfo[1].domainId).to.equal(secondDomainId);
          expect(domainInfo[1].domain.owner).to.equal(seller.address);
          expect(domainInfo[1].domain.name).to.equal(secondDomainName);
          expect(domainInfo[1].domain.expiryTime).to.equal(convertToUnixTimestamp(secondExpiryTimestamp));
          expect(domainInfo[1].domain.exchange).to.equal(ADDRESS_ZERO);
          expect(domainInfo[1].domain.listingId).to.equal(0);
        });

        it("should update userDomains with both domains", async () => {
          await subject();

          const userDomains = await verifiedDomainRegistry.getUserDomains(seller.address);
          expect(userDomains.length).to.equal(2);

          expect(userDomains[0].domainId).to.equal(domainId);
          expect(userDomains[0].domain.name).to.equal(domainName);
          expect(userDomains[0].domain.expiryTime).to.equal(convertToUnixTimestamp(expiryTimestamp));

          expect(userDomains[1].domainId).to.equal(secondDomainId);
          expect(userDomains[1].domain.name).to.equal(secondDomainName);
          expect(userDomains[1].domain.expiryTime).to.equal(convertToUnixTimestamp(secondExpiryTimestamp));
        });

        it("should emit DomainVerified events for both domains", async () => {
          await expect(subject())
            .to.emit(verifiedDomainRegistry, "DomainVerified")
            .withArgs(domainId, seller.address, domainName, convertToUnixTimestamp(expiryTimestamp))
            .and.to.emit(verifiedDomainRegistry, "DomainVerified")
            .withArgs(secondDomainId, seller.address, secondDomainName, convertToUnixTimestamp(secondExpiryTimestamp));
        });
      });

      describe("when domain is already owned", () => {

        describe("and the owner is same as the caller", () => {
          let newExpiryTimestamp: string;

          beforeEach(async () => {
            // seller claims ownership of domain
            await subject();

            newExpiryTimestamp = '2035-07-08T18:22:00';

            subjectCaller = seller;
            subjectProofs = generateProofsFromDomains([
              {
                name: domainName,
                expiryTimestamp: newExpiryTimestamp,
              }
            ]);
          });

          it("should update domainInfo", async () => {
            const previousDomainInfo = await verifiedDomainRegistry.getDomains([domainId]);

            await subject();

            const domainInfo = await verifiedDomainRegistry.getDomains([domainId]);

            expect(domainInfo.length).to.equal(1);
            expect(domainInfo[0].domainId).to.equal(domainId);
            expect(domainInfo[0].domain.owner).to.equal(seller.address);
            expect(domainInfo[0].domain.name).to.equal(domainName);
            expect(domainInfo[0].domain.expiryTime).to.equal(convertToUnixTimestamp(newExpiryTimestamp));
            expect(domainInfo[0].domain.exchange).to.equal(previousDomainInfo[0].domain.exchange);
            expect(domainInfo[0].domain.listingId).to.equal(previousDomainInfo[0].domain.listingId);
          });

          it("should NOT update userDomains", async () => {
            await subject();

            const sellerDomains = await verifiedDomainRegistry.getUserDomains(seller.address);
            expect(sellerDomains.length).to.equal(1);
            expect(sellerDomains[0].domainId).to.equal(domainId);
          });

          it("should emit DomainVerified event", async () => {
            await expect(subject()).to.emit(verifiedDomainRegistry, "DomainVerified").withArgs(
              domainId,
              seller.address,
              domainName,
              convertToUnixTimestamp(newExpiryTimestamp)
            );
          });
        });

        describe("and the owner is different from the caller", () => {
          beforeEach(async () => {
            // first seller claims ownership of domain
            await subject();

            subjectCaller = otherSeller;
            subjectProofs = generateProofsFromDomains([
              {
                name: domainName,
                expiryTimestamp: expiryTimestamp,
              }
            ]);
          });

          it("should update domain info", async () => {
            await subject();

            const domainInfo = await verifiedDomainRegistry.getDomains([domainId]);

            expect(domainInfo.length).to.equal(1);
            expect(domainInfo[0].domainId).to.equal(domainId);
            expect(domainInfo[0].domain.owner).to.equal(otherSeller.address);
            expect(domainInfo[0].domain.name).to.equal(domainName);
            expect(domainInfo[0].domain.expiryTime).to.equal(convertToUnixTimestamp(expiryTimestamp));
          });

          it("should update userDomains", async () => {
            await subject();

            const prevSellerDomains = await verifiedDomainRegistry.getUserDomains(seller.address);
            expect(prevSellerDomains.length).to.equal(0);

            const otherSellerDomains = await verifiedDomainRegistry.getUserDomains(otherSeller.address);
            expect(otherSellerDomains.length).to.equal(1);
            expect(otherSellerDomains[0].domainId).to.equal(domainId);
          });

          it("should emit DomainVerified event", async () => {
            await expect(subject()).to.emit(verifiedDomainRegistry, "DomainVerified").withArgs(
              domainId,
              otherSeller.address,
              domainName,
              convertToUnixTimestamp(expiryTimestamp)
            );
          });

          describe("when the domain is already listed on an exchange", () => {
            beforeEach(async () => {
              await verifiedDomainRegistry.connect(owner.wallet).addExchange(domainExchangeMock.address);
              await domainExchangeMock.connect(seller.wallet).createListing(domainId, ONE);
            });

            it("should reset exchange and listingId", async () => {
              await subject();

              const domainInfo = await verifiedDomainRegistry.getDomains([domainId]);
              expect(domainInfo[0].domain.exchange).to.equal(ADDRESS_ZERO);
              expect(domainInfo[0].domain.listingId).to.equal(0);
            });

            it("should remove listing from exchange", async () => {
              await subject();

              const listingActive = await domainExchangeMock.listingActive(ONE);
              expect(listingActive).to.equal(false);
            });
          });
        });
      });

      describe("when domain is expired", async () => {
        beforeEach(async () => {
          const blockTimestamp = await blockchain.getCurrentTimestamp();
          expiryTimestamp = convertUnixTimestampToDateString(blockTimestamp.sub(ONE_DAY_IN_SECONDS));

          subjectProofs = generateProofsFromDomains([
            {
              name: domainName,
              expiryTimestamp: expiryTimestamp,
            }
          ]);
        });

        it("should NOT revert", async () => {
          await expect(subject()).to.not.be.reverted;
        });
      });

      describe("when the contract is not initialized", () => {
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

    describe("#setDomainListing", async () => {
      let subjectDomainId: string;
      let subjectListingId: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        let domainName = 'groth16.xyz';
        let expiryTimestamp = '2025-07-08T18:22:00';
        let domainId = calculateDomainId(domainName);

        if (shouldInitialize) {
          // Add exchange to verifiedDomainRegistry
          await verifiedDomainRegistry.connect(owner.wallet).addExchange(exchange.address);

          // verify domain
          const proofs = generateProofsFromDomains([
            {
              name: domainName,
              expiryTimestamp: expiryTimestamp,
            }
          ]);
          await verifiedDomainRegistry.connect(seller.wallet).verifyDomains(proofs);
        }

        subjectDomainId = domainId;
        subjectListingId = ONE;
        subjectCaller = exchange;
      });

      async function subject(): Promise<any> {
        return verifiedDomainRegistry.connect(subjectCaller.wallet).setDomainListing(
          subjectDomainId,
          subjectListingId
        );
      };

      it("should update the exchange for the domain", async () => {
        await subject();
        const domainInfo = await verifiedDomainRegistry.getDomains([subjectDomainId]);
        expect(domainInfo[0].domain.exchange).to.equal(subjectCaller.address);
      });

      it("should update the listing id for the domain", async () => {
        await subject();
        const domainInfo = await verifiedDomainRegistry.getDomains([subjectDomainId]);
        expect(domainInfo[0].domain.listingId).to.equal(subjectListingId);
      });

      it("should emit a DomainListed event", async () => {
        await expect(subject()).to.emit(verifiedDomainRegistry, "DomainListed").withArgs(
          subjectDomainId,
          subjectCaller.address,
          subjectListingId
        );
      });

      describe("when the domain is not verified", () => {
        beforeEach(async () => {
          subjectDomainId = calculateDomainId("unverified.xyz");
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Domain must be verified");
        });
      });

      describe("when the domain is already listed on another exchange", () => {
        beforeEach(async () => {
          await verifiedDomainRegistry.connect(owner.wallet).addExchange(secondExchange.address);
          await verifiedDomainRegistry.connect(secondExchange.wallet).setDomainListing(subjectDomainId, ONE);

          subjectCaller = secondExchange;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Domain already listed on another exchange");
        });
      });

      describe("when the caller is not an exchange", () => {
        beforeEach(async () => {
          subjectCaller = seller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be exchange");
        });
      });

      describe("when the contract is not initialized", () => {
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

    describe("#removeDomainListing", async () => {
      let subjectDomainId: string;
      let subjectCaller: Account;

      beforeEach(async () => {
        let domainName = 'groth16.xyz';
        let expiryTimestamp = '2025-07-08T18:22:00';
        let domainId = calculateDomainId(domainName);

        if (shouldInitialize) {
          // Add exchange to verifiedDomainRegistry
          await verifiedDomainRegistry.connect(owner.wallet).addExchange(exchange.address);

          // verify domain
          const proofs = generateProofsFromDomains([
            {
              name: domainName,
              expiryTimestamp: expiryTimestamp,
            }
          ]);
          await verifiedDomainRegistry.connect(seller.wallet).verifyDomains(proofs);
          await verifiedDomainRegistry.connect(exchange.wallet).setDomainListing(domainId, ONE);
        }

        subjectDomainId = domainId;
        subjectCaller = exchange;
      });

      async function subject(): Promise<any> {
        return verifiedDomainRegistry.connect(subjectCaller.wallet).removeDomainListing(subjectDomainId);
      }

      it("should remove domain listing status", async () => {
        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomains([subjectDomainId]);
        expect(domainInfo[0].domain.listingId).to.equal(0);
      });

      it("should remove domain exchange", async () => {
        await subject();

        const domainInfo = await verifiedDomainRegistry.getDomains([subjectDomainId]);
        expect(domainInfo[0].domain.exchange).to.equal(ethers.constants.AddressZero);
      });

      it("should emit DomainListingRemoved event", async () => {
        await expect(subject()).to.emit(verifiedDomainRegistry, "DomainListingRemoved").withArgs(
          subjectDomainId,
          subjectCaller.address
        );
      });

      describe("when the domain is not listed on the calling exchange", () => {
        beforeEach(async () => {
          await verifiedDomainRegistry.connect(owner.wallet).addExchange(secondExchange.address);

          subjectCaller = secondExchange;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Domain not listed on calling exchange");
        });
      });

      describe("when the caller is not an exchange", () => {
        beforeEach(async () => {
          subjectCaller = seller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be exchange");
        });
      });

      describe("when the contract is not initialized", () => {
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

    describe("#updateDomainOnSale", async () => {
      let subjectDomainId: string;
      let subjectNewOwner: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        let domainName = 'groth16.xyz';
        let expiryTimestamp = '2025-07-08T18:22:00';
        let domainId = calculateDomainId(domainName);

        if (shouldInitialize) {
          // Add exchange to verifiedDomainRegistry
          await verifiedDomainRegistry.connect(owner.wallet).addExchange(exchange.address);

          // verify domain
          const proofs = generateProofsFromDomains([
            {
              name: domainName,
              expiryTimestamp: expiryTimestamp,
            }
          ]);
          await verifiedDomainRegistry.connect(seller.wallet).verifyDomains(proofs);

          // List the domain
          await verifiedDomainRegistry.connect(exchange.wallet).setDomainListing(domainId, ONE);
        }

        subjectDomainId = domainId;
        subjectNewOwner = otherSeller.address;
        subjectCaller = exchange;
      });

      async function subject(): Promise<any> {
        return verifiedDomainRegistry.connect(subjectCaller.wallet).updateDomainOnSale(
          subjectDomainId,
          subjectNewOwner
        );
      }

      it("should update the owner of the domain", async () => {
        await subject();
        const domainInfo = await verifiedDomainRegistry.getDomains([subjectDomainId]);
        expect(domainInfo[0].domain.owner).to.equal(subjectNewOwner);
      });

      it("should remove the exchange and listingId", async () => {
        await subject();
        const domainInfo = await verifiedDomainRegistry.getDomains([subjectDomainId]);
        expect(domainInfo[0].domain.exchange).to.equal(ethers.constants.AddressZero);
        expect(domainInfo[0].domain.listingId).to.equal(0);
      });

      it("should update the user domains", async () => {
        const prevSellerDomains = await verifiedDomainRegistry.getUserDomains(seller.address);
        expect(prevSellerDomains.length).to.equal(1);

        await subject();

        const newSellerDomains = await verifiedDomainRegistry.getUserDomains(seller.address);
        expect(newSellerDomains.length).to.equal(0);

        const buyerDomains = await verifiedDomainRegistry.getUserDomains(otherSeller.address);
        expect(buyerDomains.length).to.equal(1);
        expect(buyerDomains[0].domainId).to.equal(subjectDomainId);
      });

      it("should emit DomainTransferred event", async () => {
        await expect(subject()).to.emit(verifiedDomainRegistry, "DomainTransferred").withArgs(
          subjectDomainId,
          seller.address,
          subjectNewOwner
        );
      });

      describe("when the domain is not listed on the calling exchange", () => {
        beforeEach(async () => {
          await verifiedDomainRegistry.connect(owner.wallet).addExchange(secondExchange.address);
          subjectCaller = secondExchange;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Domain not listed on calling exchange");
        });
      });

      describe("when the caller is not an exchange", () => {
        beforeEach(async () => {
          subjectCaller = seller;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be exchange");
        });
      });

      describe("when the contract is not initialized", () => {
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
  });
  /* ============ Admin functions ============ */

  describe("#setVerifyDomainProcessor", async () => {
    let subjectNewVerifyDomainProcessor: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectNewVerifyDomainProcessor = newVerifyDomainProcessor.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return verifiedDomainRegistry.connect(subjectCaller.wallet).updateVerifyDomainProcessor(subjectNewVerifyDomainProcessor);
    }

    it("should update the verify domain processor", async () => {
      await subject();

      const newVerifyDomainProcessor = await verifiedDomainRegistry.verifyDomainProcessor();
      expect(newVerifyDomainProcessor).to.equal(subjectNewVerifyDomainProcessor);
    });

    it("should emit a VerifyDomainProcessorUpdated event", async () => {
      await expect(subject()).to.emit(verifiedDomainRegistry, "VerifyDomainProcessorUpdated").withArgs(
        subjectNewVerifyDomainProcessor
      );
    });

    describe("when new verify domain processor is zero address", async () => {
      beforeEach(async () => {
        subjectNewVerifyDomainProcessor = ethers.constants.AddressZero;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid address");
      });
    });

    describe("when caller is not owner", async () => {
      beforeEach(async () => {
        subjectCaller = seller;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  /* =========== Getter functions ============ */

  describe("#getDomainOwner", async () => {
    let domainId: string;
    let domainName: string;
    let expiryTimestamp: string;

    beforeEach(async () => {
      domainName = 'groth16.xyz';
      expiryTimestamp = '2025-07-08T18:22:00';
      domainId = calculateDomainId(domainName);

      await verifiedDomainRegistry.initialize(verifyDomainProcessor.address);
      await verifiedDomainRegistry.connect(seller.wallet).verifyDomains(generateProofsFromDomains([
        {
          name: domainName,
          expiryTimestamp: expiryTimestamp,
        }
      ]));
    });

    async function subject(): Promise<Address> {
      return await verifiedDomainRegistry.getDomainOwner(domainId);
    }

    it("should return the owner of the domain", async () => {
      const owner = await subject();
      expect(owner).to.equal(seller.address);
    });
  });

  describe("#getDomainId", async () => {
    let subjectDomainName: string;

    beforeEach(async () => {
      subjectDomainName = 'example.com';
    });

    async function subject(): Promise<string> {
      return await verifiedDomainRegistry.getDomainId(subjectDomainName);
    }

    it("should return the correct domain ID", async () => {
      const actualDomainId = await subject();
      const expectedDomainId = calculateDomainId(subjectDomainName);
      expect(actualDomainId).to.equal(expectedDomainId);
    });
  });

  describe("#addExchange", async () => {
    let subjectExchange: Address;
    let subjectCaller: Account;

    let shouldInitialize: boolean = true;

    beforeEach(async () => {
      if (shouldInitialize) {
        await verifiedDomainRegistry.initialize(verifyDomainProcessor.address);
      }

      subjectExchange = exchange.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return verifiedDomainRegistry.connect(subjectCaller.wallet).addExchange(subjectExchange);
    }

    it("should update the exchanges array and mapping correctly", async () => {
      await subject();

      const actualIsExchange = await verifiedDomainRegistry.isExchange(exchange.address);
      const actualExchanges = await verifiedDomainRegistry.getExchanges();

      expect(actualIsExchange).to.be.true;
      expect(actualExchanges).to.deep.equal([exchange.address]);
    });

    it("should emit the correct ExchangeAdded event", async () => {
      await expect(subject()).to.emit(verifiedDomainRegistry, "ExchangeAdded").withArgs(exchange.address);
    });

    describe("when the exchange is already added", async () => {
      beforeEach(async () => {
        await subject();

        subjectExchange = exchange.address;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Duplicate exchange");
      });
    });

    describe("when the contract has not been initialized", async () => {
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

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = seller;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#removeExchange", async () => {
    let subjectExchange: Address;
    let subjectCaller: Account;

    let shouldInitialize: boolean = true;

    beforeEach(async () => {
      if (shouldInitialize) {
        await verifiedDomainRegistry.initialize(verifyDomainProcessor.address);
        await verifiedDomainRegistry.connect(owner.wallet).addExchange(exchange.address);
      }

      subjectExchange = exchange.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return verifiedDomainRegistry.connect(subjectCaller.wallet).removeExchange(subjectExchange);
    }

    it("should update the exchanges array and mapping correctly", async () => {
      await subject();

      const actualIsExchange = await verifiedDomainRegistry.isExchange(exchange.address);
      const actualExchanges = await verifiedDomainRegistry.getExchanges();

      expect(actualIsExchange).to.be.false;
      expect(actualExchanges).to.deep.equal([]);
    });

    it("should emit the correct ExchangeRemoved event", async () => {
      await expect(subject()).to.emit(verifiedDomainRegistry, "ExchangeRemoved").withArgs(exchange.address);
    });

    describe("when the exchange is not already added", async () => {
      beforeEach(async () => {
        await subject();

        subjectExchange = exchange.address;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Exchange does not exist");
      });
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = seller;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when the contract has not been initialized", async () => {
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
});