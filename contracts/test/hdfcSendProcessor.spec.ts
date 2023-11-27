import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapter, NullifierRegistry, HDFCSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { GrothProof } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x06b0ad846d386f60e777f1d11b82922c6bb694216eed9c23535796ac404a7dfa","0x0000000000000000000000000000000000000000000000000040737472656c61","0x000000000000000000000000000000000000000000000000006e616263666468","0x00000000000000000000000000000000000000000000000000000074656e2e6b","0x0000000000000000000000000000000000000000000000000000000030302e32","0x0000000000000000000000000000000000000000000000000000000000000000","0x000000000000000000000000000000000000000000000000003132202c657554","0x00000000000000000000000000000000000000000000000000303220766f4e20","0x00000000000000000000000000000000000000000000000000353a3131203332","0x00000000000000000000000000000000000000000000000000302b2038303a38","0x0000000000000000000000000000000000000000000000000000000000303335","0x289f0a06c13a6da467525afd78bfb1726b96c2023a4b898ba86c8f30484d7e57","0x2f535d3de466b90da2ef9ab2f8528db161ea9f2ffdfc5154489ecd6e0b96f07f","0x0000000000000000000000000000000000000000000000000000000000003039"];

describe("HDFCSendProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapter;
  let nullifierRegistry: NullifierRegistry;
  let sendProcessor: HDFCSendProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
      ramp
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    keyHashAdapter = await deployer.deployManagedKeyHashAdapter(rawSignals[0]);
    nullifierRegistry = await deployer.deployNullifierRegistry();
    sendProcessor = await deployer.deployHDFCSendProcessor(
      ramp.address,
      keyHashAdapter.address,
      nullifierRegistry.address,
      "alerts@hdfcbank.net"
    );

    await nullifierRegistry.connect(owner.wallet).addWritePermission(sendProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await sendProcessor.ramp();
      const venmoKeyHashAdapter = await sendProcessor.mailserverKeyHashAdapter();
      const emailFromAddress = await sendProcessor.getEmailFromAddress();

      expect(rampAddress).to.eq(ramp.address);
      expect(venmoKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
      expect(ethers.utils.toUtf8Bytes("alerts@hdfcbank.net")).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });
  });

  describe("#processProof", async () => {
    let subjectProof: GrothProof;
    let subjectCaller: Account;

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x1acbbdec5e18e98bf660d405761b9177651cc6bfc13419603c30e116a489faf8"), BigNumber.from("0x258daa9bbd1cc9a3af0e919325488a484c66a2a82088e05d508ee5bcbbe595f4")]
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x130ed0cc8ebe8ec85e6304bea7612354e9e6bae12f90d858dd1dc16740dc4a4f"), BigNumber.from("0x056df8f69c8c4b78caeaa63e3571cbf1639f722987088fcaf1d25defd2b35aff")],
        [BigNumber.from("0x08ba8bd372363dc390da4135c8584b8d7c907f78ed4bbf086561f4b0ba132fa7"), BigNumber.from("0x1f360f513430e1a319874c716f7218e8f34dc890e2670e48eaffd6b02b64eea3")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x2baf1c61fd041e64d052058940efeca29e7601def2682cd748371b0af6630420"), BigNumber.from("0x2c9410875a83b3ea48772575bf04e2a82d5a5e977501f94f34cd62ddbc219ff9")];
      const signals: BigNumber[] = rawSignals.map((signal) => BigNumber.from(signal));

      subjectProof = {
        a,
        b,
        c,
        signals
      };

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
        intentHash
      } = await subjectCallStatic();
      
      expect(amount).to.eq(usdc(2));
      expect(timestamp).to.eq(BigNumber.from(1700548088));
      expect(offRamperIdHash).to.eq(rawSignals[11]);
      expect(intentHash).to.eq(rawSignals[13]);
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await nullifierRegistry.isNullified(subjectProof.signals[12].toHexString());

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
        await keyHashAdapter.setMailserverKeyHash(ZERO_BYTES32);
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

      const venmoKeyHashAdapter = await sendProcessor.mailserverKeyHashAdapter();
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
});
