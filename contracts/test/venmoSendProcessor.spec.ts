import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapter, VenmoSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { Address, GrothProof } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x00000000000000000000000000000000000000000000000000000030302e3033","0x283cddc41a36a87fa4a15dcb26372a1e0baddfd92edf39fc697e639f38f9f008","0x0228e20fc2bc01b0f9ed78a9de64191215d3830bd01602b313b68eb55ae8e4a6","0x0000000000000000000000000000000000000000000000000000000000000001"];

describe("VenmoSendProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapter;
  let sendProcessor: VenmoSendProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
      ramp
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    keyHashAdapter = await deployer.deployManagedKeyHashAdapter(rawSignals[0]);
    sendProcessor = await deployer.deployVenmoSendProcessor(
      ramp.address,
      keyHashAdapter.address,
      "venmo@venmo.com".padEnd(21, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectRamp: Address;
    let subjectVenmoKeyHashAdapter: Address;
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectRamp = ramp.address;
      subjectVenmoKeyHashAdapter = keyHashAdapter.address;
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(21, "\0"); // Pad the address to match length returned by circuit
    });

    async function subject(): Promise<any> {
      return await deployer.deployVenmoSendProcessor(subjectRamp, subjectVenmoKeyHashAdapter, subjectEmailFromAddress);
    }

    it("should set the correct state", async () => {
      await subject();

      const rampAddress = await sendProcessor.ramp();
      const venmoKeyHashAdapter = await sendProcessor.venmoMailserverKeyHashAdapter();
      const emailFromAddress = await sendProcessor.getEmailFromAddress();

      expect(rampAddress).to.eq(subjectRamp);
      expect(venmoKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
      expect(ethers.utils.toUtf8Bytes("venmo@venmo.com".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });

    describe("when the email address is not properly padded", async () => {
      beforeEach(async () => {
        subjectEmailFromAddress = "venmo@venmo.com".padEnd(34, "\0");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Email from address not properly padded");
      });
    });
  });

  describe("#processProof", async () => {
    let subjectProof: GrothProof;
    let subjectCaller: Account;

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x19399342135f794c60ce582cf217fea4c6156ba93e936136cd4ef333be37a0ea"), BigNumber.from("0x106574581a5358047f53540a7c3e628e52a455d7c7ddce60c4bfcf2b3cf296e7")]
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x0ee7349f38607732d6056299f6556916f674fa20be0a4bbe8555f6be01cf9a62"), BigNumber.from("0x0fd27162f0b02310cf5070f8279a2a7aacc0752b773fd1ad3bc1457a00bd7b5d")],
        [BigNumber.from("0x2c94f9494007ad27a8e38e35075195d73ac6955d5d117b8706eeca71f8a8f470"), BigNumber.from("0x0085348965dba19218989d6711d2914d143d67f5bcb8f0ad5d16e9695caef3dc")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x025c083612aedc19d7ccf57681c47dedcbcb026121364a87f8f231bca2d64ab4"), BigNumber.from("0x300459ebd5da289008a332c08b34d426c316845d386c82919b6dea5fc8ec5f3f")];
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
        offRamperIdHash,
        intentHash
      } = await subjectCallStatic();

      expect(amount).to.eq(usdc(30));
      expect(offRamperIdHash).to.eq(rawSignals[5]);
      expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000000001");
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await sendProcessor.isEmailNullified(subjectProof.signals[6].toHexString());

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
        await keyHashAdapter.setVenmoMailserverKeyHash(ZERO_BYTES32);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid mailserver key hash");
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

  describe("#setVenmoMailserverKeyHashAdapter", async () => {
    let subjectVenmoMailserverKeyHashAdapter: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVenmoMailserverKeyHashAdapter = attacker.address;
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).setVenmoMailserverKeyHashAdapter(subjectVenmoMailserverKeyHashAdapter);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHashAdapter = await sendProcessor.venmoMailserverKeyHashAdapter();
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

    describe("when the email address is not properly padded", async () => {
      beforeEach(async () => {
        subjectEmailFromAddress = "venmo@venmo.com".padEnd(34, "\0");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Email from address not properly padded");
      });
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
