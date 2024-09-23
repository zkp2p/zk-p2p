
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
  a: ["0x0b41949db87737e024b3bed1edd6171a75808f6b58107753fe5ade77549b34bf", "0x193294464e08f9c027968d801b49519b4241b75baeb07a5443d22a4967d8f7d3"],
  b: [["0x02bc8b2475294659f17963bdd47e1d04ab7fca46a48037c10700ae0f181c9be0", "0x29b2c1d94990c4cbce5498e73b87d4a6d2b711866dcdab30adbd9dad1c8eb226"], ["0x1b1e1646f833e35d5bac78e393ded34b5d787b8afec23da41bb40a0c65f652d0", "0x104b472e664902139711d950806fa11353d169469a88967d3a6b239ae87936b1"]],
  c: ["0x2374e81bd27013e446f2557941bb0425cd3ed48a68679cdc401a34458fa0b8f5", "0x300ab5c4a6ad9eb48e1fb1758c2921b75b7431bcda69814fad249678734d85b8"],
  signals: [
    "0x0db7730bdd90c823601ed32395c8b2f3307fd4adc477ca22bf3ed406c1b3ae4a",
    "0x00000000000000000000006d6f632e7061656863656d616e4074726f70707573",
    "0x000000000000000000000000000000007a79782e676e61696c64726168636972",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x2d5c62f5adcd38b107d729c9aec6b3db0656e9e85d6b57958b2cafc05f33aee9",
    "0x03f8eaaf8ba3455f0ba539b498badfb27d610e55ad1da459dcf7be7d380d0cbd",
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
      expect(domainName).to.eq('0xsachink.xyz');
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
