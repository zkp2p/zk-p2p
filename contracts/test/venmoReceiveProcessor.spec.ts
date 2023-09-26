import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { VenmoReceiveProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { GrothProof } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000039313136383631","0x0000000000000000000000000000000000000000000000000000000000313535","0x22a3366f188d3ab2a4df5829aadcda78f67d0895c5eccd73b1b66fb98b9c5728","0x144c33574165cbe6a470bc432014a43d9f9455e58b3a5587220148208e7f92fe","0x0000000000000000000000000000000000000000000000000000000000000001"];

describe("VenmoReceiveProcessor", () => {
  let owner: Account;
  let attacker: Account;

  let receiveProcessor: VenmoReceiveProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    receiveProcessor = await deployer.deployVenmoReceiveProcessor(
      rawSignals[0],
      "venmo@venmo.com".padEnd(42, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectVenmoKeys: string;
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectVenmoKeys = rawSignals[0];
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(42, "\0"); // Pad the address to match length returned by circuit
    });

    async function subject(): Promise<any> {
      return await deployer.deployVenmoReceiveProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await receiveProcessor.venmoMailserverKeyHash();
      expect(venmoKeys).to.deep.equal(rawSignals[0]);
    });

    it("should set the correct email from address", async () => {
      await subject();

      const emailFromAddress = await receiveProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("venmo@venmo.com".padEnd(42, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
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

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x2c4be5346db95a0e0e4b73c80830b1e890f670511b3afc74afb7f69e5799b3af"), BigNumber.from("0x26c8881cd622dcc39da686434dcdc66d0e2a9a48c9f1bee371137673d34bf67d")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x2917f2695bc4d4205f61227cde494954d1bb691076ef5a7eeebcfdfcde777ce7"), BigNumber.from("0x1cbdc3474067b0a16a2257e610a8e105b0238da9470bc7b04e45ed251322c3ce")],
        [BigNumber.from("0x1fdcd2ae80be31b41daec2a88e769ed2bdc0e34b8ab826910891dff1d5710fe6"), BigNumber.from("0x217498c5780618a92ea58687e566e92bbc24781542f8f53c4eeb3823df4c0b25")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x2e3fca8a87018a2199a78019892bb62ad90e65a1ee90f17f3e0b7d8f6418d789"), BigNumber.from("0x1d61dae6923f0626a24beb9ffa3c17b4a50e3ec5dc096ac2cabab21322bd0218")];
      const signals: BigNumber[] = rawSignals.map((signal) => BigNumber.from(signal));

      subjectProof = {
        a,
        b,
        c,
        signals
      };
    });

    async function subject(): Promise<any> {
      return await receiveProcessor.processProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await receiveProcessor.callStatic.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const {
        timestamp,
        onRamperIdHash,
        intentHash
      } = await subjectCallStatic();

      expect(timestamp).to.eq(BigNumber.from(1686119551));
      expect(onRamperIdHash).to.eq(rawSignals[9]);
      expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000000001");
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await receiveProcessor.isEmailNullified(subjectProof.signals[10].toHexString());

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
        await receiveProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(42, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the mailserver key hash doesn't match", async () => {
      beforeEach(async () => {
        await receiveProcessor.setVenmoMailserverKeyHash(ZERO_BYTES32);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid mailserver key hash");
      });
    });
  });

  describe("#setVenmoMailserverKeyHash", async () => {
    let subjectVenmoMailserverKeyHash: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVenmoMailserverKeyHash = BigNumber.from(rawSignals[0]).add(1).toHexString();
    });

    async function subject(): Promise<any> {
      return await receiveProcessor.connect(subjectCaller.wallet).setVenmoMailserverKeyHash(subjectVenmoMailserverKeyHash);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHash = await receiveProcessor.venmoMailserverKeyHash();
      expect(venmoKeyHash).to.equal(subjectVenmoMailserverKeyHash);
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

      subjectEmailFromAddress = "new-venmo@venmo.com".padEnd(42, "\0");
    });

    async function subject(): Promise<any> {
      return await receiveProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await receiveProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("new-venmo@venmo.com".padEnd(42, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
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
