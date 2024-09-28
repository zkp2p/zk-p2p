
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
  a: ["0x1da657c429291fec827f1d5aa527dd91d268eade14a392a967f878f32fd72706", "0x134c044c99a85819c9fec01077f249b38195234acbc36ebff3306643644b7871"],
  b: [["0x285cab51d06c8c044aaeb93a23027853831b319b957e6ad117904859d5c3401a", "0x2fd0bf676a9fa482c9014051468ef924f679444a17b8593c10836d75ad7d5356"], ["0x2c5df164fd4f6c593dfc2c5fa4179bca6b660b1e60b19d075b47f5de941d6c97", "0x12e7f3e4017ba1c5eded4254b3e9f25be9457b13d5a25d351184b1f2e995f29a"]],
  c: ["0x2b36e232f2b3f0aec36313f599225cbf80ead1e541be57e5aa0839884d37642f", "0x130cc647d0723eaef2c77418ece5b2316f180a212d39da74c11ed03cb28b137a"],
  signals: [
    "0x0db7730bdd90c823601ed32395c8b2f3307fd4adc477ca22bf3ed406c1b3ae4a",
    "0x00000000000000000000006d6f632e7061656863656d616e4074726f70707573",
    "0x000000000000000000000000000000000000007a79782e6b6e69686361737830",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0eb1ad46280bbf5bd7a0d41063cbbb476793e04afac70d9ce2ee3f7c1b37a436",
    "0x02fe53626e1f9442403f5863be3c41874b5edaa0a8752b86d700cf8f77083ed2",
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
