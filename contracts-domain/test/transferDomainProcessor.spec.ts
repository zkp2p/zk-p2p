
import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber, Bytes, BytesLike } from "ethers";

import { Account } from "@utils/test/types";
import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

import DeployHelper from "@utils/deploys";
import { Groth16Proof } from "@utils/types";
import { createTypedGroth16Proof } from "@utils/protocolUtils";
import {
  TransferDomainProcessor,
  ManagedKeyHashAdapterV2,
  NullifierRegistry
} from "@utils/contracts";

const expect = getWaffleExpect();

const PROOF = {
  a: ["0x292bbb24032132ee63149adf98b766443fcabe98edecc0d40ca6c03d4d4439f2", "0x129475199792277d6171ff2cb83f39c8071ca02d1cd5812a3e1bde2a5e7c614c"],
  b: [["0x1a5da248b050a894c9a0e11c6b30fcad47a39fe4ad7af83a97ed42827512ca3e", "0x02f767a3e96d8c5db4102210dbd7831200f8621e30addd9d528d1f1cb2dbd796"], ["0x1bfd97c314f5d36270022215384658d96cbc354900c4e20d490cdf680d1e4583", "0x1e4d1a48ecc369c0c885c0fa24970c087ec21bb7b99abbef247578c7ea1adb13"]],
  c: ["0x06fd24abf835692f90f1fe1ca00c6d96e88f39acf38b43173b2ae715f6b37696", "0x12ffcaec17c3bbdeaabd8b7838593a2952ba2b6f68fe61b7ac7eae5560affb5c"],
  signals: [
    "0x0db7730bdd90c823601ed32395c8b2f3307fd4adc477ca22bf3ed406c1b3ae4a",
    "0x00000000000000000000006d6f632e7061656863656d616e4074726f70707573",
    "0x000000000000000000000000000000007a79782e676e61696c64726168636972",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x2d5c62f5adcd38b107d729c9aec6b3db0656e9e85d6b57958b2cafc05f33aee9",
    "0x0196972d6498372690eb6e2b761c2fa189eaca0033d1231e9877b403d13e06e8",
    "0x0000000000000000000000000000000000000000000000000000000000003039"
  ]
}

describe("TransferDomainProcessor", () => {
  let owner: Account;
  let exchange: Account;

  let nullifierRegistry: NullifierRegistry;
  let xferDomainProcessor: TransferDomainProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      exchange
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    nullifierRegistry = await deployer.deployNullifierRegistry();
    xferDomainProcessor = await deployer.deployTransferDomainProcessor(
      exchange.address,
      nullifierRegistry.address,
      "support@namecheap.com"
    );

    await nullifierRegistry.addWritePermission(xferDomainProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const emailFromAddress = await xferDomainProcessor.getEmailFromAddress();

      expect(await xferDomainProcessor.exchange()).to.equal(exchange.address);
      expect(await xferDomainProcessor.nullifierRegistry()).to.equal(nullifierRegistry.address);
      expect(ethers.utils.arrayify(emailFromAddress)).to.deep.equal(ethers.utils.toUtf8Bytes("support@namecheap.com"));
    });
  });

  describe("#processProof", async () => {
    let subjectProof: Groth16Proof;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = createTypedGroth16Proof(PROOF.a, PROOF.b, PROOF.c, PROOF.signals);
      subjectCaller = exchange;
    });

    async function subject(): Promise<any> {
      return xferDomainProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return xferDomainProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const {
        dkimKeyHash,
        hashedReceiverId,
        domainName,
        bidId
      } = await subjectCallStatic();

      expect(dkimKeyHash).to.eq(PROOF.signals[0]);
      expect(domainName).to.eq('richardliang.xyz');
      expect(hashedReceiverId).to.eq(PROOF.signals[7]);
      expect(bidId).to.eq("12345");
    });

    it("should add the email to the nullifier registry", async () => {
      await subject();

      const isNullified = await nullifierRegistry.isNullified(subjectProof.signals[8].toHexString());
      expect(isNullified).to.be.true;
    });

    describe("when the proof is invalid", () => {
      beforeEach(() => {
        subjectProof = createTypedGroth16Proof(PROOF.a, PROOF.b, PROOF.c, [ethers.constants.HashZero, ...PROOF.signals.slice(1)]);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid Proof");
      });
    });

    describe("when the from email address is invalid", () => {
      beforeEach(async () => {
        await xferDomainProcessor.setEmailFromAddress("support@Namecheap.com");   // capital N
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the email has been used previously", () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Nullifier has already been used");
      });
    });

    describe("when caller is not the exchange", () => {
      beforeEach(() => {
        subjectCaller = owner;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Only exchange can call this function");
      });
    });
  });
});
