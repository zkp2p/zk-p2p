
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
  a: ["0x059c8c0e7670dc9f4a7d232ae626a0156465d18afb5b3e30568c45190e187b44", "0x13f9a331a715a0bdf3acbef2cfef112ef7c0bec2923cf6fbf1045b134fdc515c"],
  b: [["0x1b7ee44e227b864324468b2fbaab14643e52fa9013f1aecd8785a942e64eaf2c", "0x2eeaf78f3e4d5e4ab4389b2b7abbbb5db25c2118565c4438d61f2ddf2479eaad"], ["0x1bcb86fc0c2d9349fc4f77ca4ecb543dca234726446534711089685158022c6c", "0x207a434b2b0065edb571d2e09bf71de158a7c325d4409b2159c7f4dd575de032"]],
  c: ["0x0fb91dbfa8fdd5911eba579d168314d65c481507a351929d1f430189b9df0f39", "0x2645bdb20e59e39c409c739b898531611ce480159f7472a4fba62e073dcb0159"],
  signals: [
    "0x0db7730bdd90c823601ed32395c8b2f3307fd4adc477ca22bf3ed406c1b3ae4a",
    "0x00000000000000000000006d6f632e7061656863656d616e4074726f70707573",
    "0x000000000000000000000000000000000000007a79782e6b6e69686361737830",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x18834c638fe786bb79a96feedbf6faecec5176c6114542fcd52001473c52c27f",
    "0x0cdd1d748847e878785085983b90829ef652eaf3ce523f873984479cbb57c760",
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
