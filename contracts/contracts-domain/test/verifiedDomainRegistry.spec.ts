
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
import { ONE_DAY_IN_SECONDS, ZERO } from "@utils/constants";
import {
  calculateDomainId,
  convertToUnixTimestamp,
  generateProofsFromDomains,
  convertUnixTimestampToDateString
} from "@utils/protocolUtils";
import {
  IProxyBaseProcessor,
  VerifiedDomainRegistry,
  VerifyDomainProcessorMock
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

  let snapshotId: string;
  let domainExpiryBuffer: BigNumber;
  let deployer: DeployHelper;

  before(async () => {
    [
      owner,
      seller,
      otherSeller
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    domainExpiryBuffer = ONE_DAY_IN_SECONDS.mul(7);

    verifyDomainProcessor = await deployer.deployVerifyDomainProcessorMock();
    verifiedDomainRegistry = await deployer.deployVerifiedDomainRegistry(domainExpiryBuffer);
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
      expect(await verifiedDomainRegistry.domainExpiryBuffer()).to.equal(domainExpiryBuffer);
      expect(await verifiedDomainRegistry.isInitialized()).to.equal(false);
    });
  });

  describe("#initialize", async () => {
    let subjectVerifyDomainProcessor: Address;

    beforeEach(async () => {
      subjectVerifyDomainProcessor = verifyDomainProcessor.address;
    });

    async function subject(): Promise<any> {
      await verifiedDomainRegistry.initialize(subjectVerifyDomainProcessor);
    }

    it("should set the correct parameters", async () => {
      await subject();

      expect(await verifiedDomainRegistry.isInitialized()).to.equal(true);
    });

    it("should set initialize to true", async () => {
      await subject();

      expect(await verifiedDomainRegistry.isInitialized()).to.equal(true);
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
      });

      it("should update userDomains", async () => {
        await subject();

        const userDomains = await verifiedDomainRegistry.getUserDomains(seller.address);
        expect(userDomains.length).to.equal(1);
        expect(userDomains[0].domainId).to.equal(domainId);
        expect(userDomains[0].domain.name).to.equal(domainName);
        expect(userDomains[0].domain.expiryTime).to.equal(convertToUnixTimestamp(expiryTimestamp));
      });

      it("should emit DomainVerified event", async () => {
        await expect(subject()).to.emit(verifiedDomainRegistry, "DomainVerified").withArgs(
          domainId,
          seller.address,
          domainName
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

          expect(domainInfo[1].domainId).to.equal(secondDomainId);
          expect(domainInfo[1].domain.owner).to.equal(seller.address);
          expect(domainInfo[1].domain.name).to.equal(secondDomainName);
          expect(domainInfo[1].domain.expiryTime).to.equal(convertToUnixTimestamp(secondExpiryTimestamp));
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
            .withArgs(domainId, seller.address, domainName)
            .and.to.emit(verifiedDomainRegistry, "DomainVerified")
            .withArgs(secondDomainId, seller.address, secondDomainName);
        });
      });

      describe("when domain is already owned by someone else", () => {
        beforeEach(async () => {
          // seller clams ownership of domain
          await subject();

          subjectCaller = otherSeller;
          subjectProofs = generateProofsFromDomains([
            {
              name: domainName,
              expiryTimestamp: expiryTimestamp,
            }
          ]);
        });

        it("should update ownership", async () => {
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
            domainName
          );
        });
      });

      describe("when domain is about to be expired", async () => {
        beforeEach(async () => {
          const blockTimestamp = await blockchain.getCurrentTimestamp();
          expiryTimestamp = convertUnixTimestampToDateString(blockTimestamp.add(domainExpiryBuffer).sub(ONE_DAY_IN_SECONDS));

          subjectProofs = generateProofsFromDomains([
            {
              name: domainName,
              expiryTimestamp: expiryTimestamp,
            }
          ]);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Domain about to be expired");
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

  describe("#updateDomainExpiryBuffer", async () => {
    let subjectNewDomainExpiryBuffer: BigNumber;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectNewDomainExpiryBuffer = ONE_DAY_IN_SECONDS.mul(7);
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return verifiedDomainRegistry.connect(subjectCaller.wallet).updateDomainExpiryBuffer(subjectNewDomainExpiryBuffer);
    }

    it("should update the domain expiry buffer period", async () => {
      await subject();

      const newDomainExpiryBuffer = await verifiedDomainRegistry.domainExpiryBuffer();
      expect(newDomainExpiryBuffer).to.equal(subjectNewDomainExpiryBuffer);
    });

    it("should emit a DomainExpiryBufferUpdated event", async () => {
      await expect(subject()).to.emit(verifiedDomainRegistry, "DomainExpiryBufferUpdated").withArgs(subjectNewDomainExpiryBuffer);
    });

    describe("when new domain expiry buffer period is zero", async () => {
      beforeEach(async () => {
        subjectNewDomainExpiryBuffer = ZERO;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Domain expiry buffer must be greater than 0");
      });
    });

    describe("when caller is not admin", async () => {
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
});