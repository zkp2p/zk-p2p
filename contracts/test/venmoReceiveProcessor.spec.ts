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

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000039313136383631","0x0000000000000000000000000000000000000000000000000000000000313535","0x054a039b8d6702ff0debda8751d55f1e353cf737c175828661b5701a4daedcf4","0x144c33574165cbe6a470bc432014a43d9f9455e58b3a5587220148208e7f92fe","0x0000000000000000000000000000000000000000000000000000000000000001"];

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
      "venmo@venmo.com".padEnd(21, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectVenmoKeys: string;
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectVenmoKeys = rawSignals[0];
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(21, "\0"); // Pad the address to match length returned by circuit
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

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x2f4923ada5c51172f95d6dbbcf93c98e42fb78f121272f750709100b512dd54c"), BigNumber.from("0x0ecf582f63047175f4ce9abc1f6419d259ebc9fad3106989123772df3d8599f9")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x175d6189b57fb88dfa4548f541c33fa3b879c5a357828a1dcf1927c802a70491"), BigNumber.from("0x2e343b252c648772284cda3cd74e9c5f0b3225af3362ca8664b19c4a787a56e0")],
        [BigNumber.from("0x1660b0cddab59fea9132050f08a17e6e90990bfe8b7e36880e71c0b9a9f66173"), BigNumber.from("0x1743dbe4b1937e3d62a35bf86ff93974c5a61100d3892a0dd0be9b2505e1e591")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x1591b8052f6178a222e873da207e84aff976a9d2e071320c4838274f62e3bb64"), BigNumber.from("0x0165f25cd1a66edd775d6491bff49776d9760881252575e811c5cc8c1a73a4b1")];
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
      expect(onRamperIdHash).to.eq(rawSignals[6]);
      expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000000001");
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await receiveProcessor.isEmailNullified(subjectProof.signals[7].toHexString());

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
        await receiveProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(21, "\0"));
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

      subjectEmailFromAddress = "new-venmo@venmo.com".padEnd(21, "\0");
    });

    async function subject(): Promise<any> {
      return await receiveProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await receiveProcessor.getEmailFromAddress();

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
