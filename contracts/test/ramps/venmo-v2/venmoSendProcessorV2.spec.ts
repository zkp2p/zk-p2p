import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapterV2, NullifierRegistry, VenmoSendProcessorV2 } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { GrothProof } from "@utils/types";
import { createTypedSendProof } from "@utils/protocolUtils";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";

const expect = getWaffleExpect();

const rawSignals = ["0x2ea3f223adbee4865e0cbfa3a6e748b1505a0094fd92c53d3d0dd2d4b0cd19d3","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000030302e31","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000034373430323731","0x0000000000000000000000000000000000000000000000000000000000383238","0x29382ba0868fe29ecd3ea0681bcae58446512506b77a2d9a97b10f98e7dd0fed","0x0741728e3aae72eda484e8ccbf00f843c38eae9c399b9bd7fb2b5ee7a055b6bf","0x2853e9d887ea6659f8ef759f9b3a7ba9ce2e5a9a64d0c19d689199a57b16490e","0x0000000000000000000000000000000000000000000000000000000000003039"];

describe("VenmoSendProcessorV2", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapterV2;
  let nullifierRegistry: NullifierRegistry;
  let sendProcessor: VenmoSendProcessorV2;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
      ramp
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    keyHashAdapter = await deployer.deployManagedKeyHashAdapterV2([rawSignals[0]]);
    nullifierRegistry = await deployer.deployNullifierRegistry();
    sendProcessor = await deployer.deployVenmoSendProcessorV2(
      ramp.address,
      keyHashAdapter.address,
      nullifierRegistry.address,
      "venmo@venmo.com"
    );

    await nullifierRegistry.connect(owner.wallet).addWritePermission(sendProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await sendProcessor.ramp();
      const venmoKeyHashAdapter = await sendProcessor.mailServerKeyHashAdapter();
      const emailFromAddress = await sendProcessor.getEmailFromAddress();

      expect(rampAddress).to.eq(ramp.address);
      expect(venmoKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
      expect(ethers.utils.toUtf8Bytes("venmo@venmo.com")).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });
  });

  describe("#processProof", async () => {
    let subjectProof: GrothProof;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = createTypedSendProof(
        ["0x0ef021063069a201fc0a18c75d1e5c416d8325a394f2bc26a022a77bb6ee142e", "0x23a720f18295af568cca4c4475830cb39bb30970d56ec89548972d16419d1534"],
        [["0x209ad56183c84729f598604a07514bddfc6037a7f762622595d434f19a843bb1", "0x055b12d60623f5fd2dbd6c862b928bc9ddd1d0ae68a5dde91f3aa98b762d5216"],["0x2d444a7965fb75c22ece81dc2e752c38645ae5d2db665997c243200d53cecd22", "0x1c059913e6e4b4a2bcaea29679d3d692298ed08cf1d9d38fb8b688553342dd1d"]],
        ["0x1a188bd46a3eff12a4cbd684783d7c18163845bf2a8410e9c38c145d42e199e0", "0x250783c44dff509251f089497c78f2daabbb8c4230b4c9bef84da406c375f322"],
        rawSignals
      );

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const {
        amount,
        timestamp,
        offRamperIdHash,
        onRamperIdHash,
        intentHash
      } = await subjectCallStatic();

      expect(amount).to.eq(usdc(1));
      expect(timestamp).to.eq(BigNumber.from(1720474828).add(30));  // 30s is default timestamp buffer
      expect(offRamperIdHash).to.eq(rawSignals[8]);
      expect(onRamperIdHash).to.eq(rawSignals[9]);
      expect(intentHash).to.eq(rawSignals[11]);
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await nullifierRegistry.isNullified(subjectProof.signals[10].toHexString());

      expect(isNullified).to.be.true;
    });

    describe("when the proof is invalid", async () => {
      beforeEach(async () => {
        subjectProof.signals[0] = BigNumber.from("0x0000000000000000000000000000000000000000000000000076406f6d6e6476");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid Proof");
      });
    });

    describe("when the email is from an invalid venmo address", async () => {
      beforeEach(async () => {
        await sendProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(21, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await keyHashAdapter.removeMailServerKeyHash(rawSignals[0]);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid mailserver key hash");
      });
    });

    describe("when the e-mail was used previously", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Nullifier has already been used");
      });
    });

    describe("when the caller is not the Ramp", async () => {
      beforeEach(async () => {
        subjectCaller = owner;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Only Ramp can call this function");
      });
    });
  });

  describe("#setMailserverKeyHashAdapter", async () => {
    let subjectVenmoMailserverKeyHashAdapter: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVenmoMailserverKeyHashAdapter = attacker.address;
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).setMailserverKeyHashAdapter(subjectVenmoMailserverKeyHashAdapter);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHashAdapter = await sendProcessor.mailServerKeyHashAdapter();
      expect(venmoKeyHashAdapter).to.equal(subjectVenmoMailserverKeyHashAdapter);
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = attacker;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#setEmailFromAddress", async () => {
    let subjectEmailFromAddress: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectEmailFromAddress = "new-venmo@venmo.com".padEnd(21, "\0");
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await sendProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("new-venmo@venmo.com".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = attacker;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#setTimestampBuffer", async () => {
    let subjectTimestampBuffer: BigNumber;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectTimestampBuffer = BigNumber.from(60);
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).setTimestampBuffer(subjectTimestampBuffer);
    }

    it("should set the timestamp buffer", async () => {
      await subject();

      const timestampBuffer = await sendProcessor.timestampBuffer();

      expect(subjectTimestampBuffer).to.deep.equal(timestampBuffer);
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = attacker;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
