import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapter, VenmoReceiveProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { Address, GrothProof } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000039313136383631","0x0000000000000000000000000000000000000000000000000000000000313535","0x29382ba0868fe29ecd3ea0681bcae58446512506b77a2d9a97b10f98e7dd0fed","0x2b3988d84418519ed7d30e7032a19e8755404f2d3ceae36b152b5e97c432966a","0x0000000000000000000000000000000000000000000000000000000000000001"];

describe("VenmoReceiveProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapter;
  let receiveProcessor: VenmoReceiveProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
      ramp
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    keyHashAdapter = await deployer.deployManagedKeyHashAdapter(rawSignals[0]);
    receiveProcessor = await deployer.deployVenmoReceiveProcessor(
      ramp.address,
      keyHashAdapter.address,
      "venmo@venmo.com".padEnd(21, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectRamp: Address;
    let subjectVenmoKeys: Address;
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectRamp = ramp.address;
      subjectVenmoKeys = keyHashAdapter.address;
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(21, "\0"); // Pad the address to match length returned by circuit
    });

    async function subject(): Promise<any> {
      return await deployer.deployVenmoReceiveProcessor(subjectRamp, subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct state", async () => {
      await subject();

      const rampAddress = await receiveProcessor.ramp();
      const venmoKeyHashAdapter = await receiveProcessor.venmoMailserverKeyHashAdapter();
      const emailFromAddress = await receiveProcessor.getEmailFromAddress();

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
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x267bf058e27a28f3003b5dae3f8b14fe9aa6ac60059d095dca816a35c92d9c72"), BigNumber.from("0x1796ac5fc7c0a474fcab10a8e65ad2d664e52f2407ba7eb80f11c1653d7647e3")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x2c08e0d3acc1bde0116fd97bbb00587c465f57919d166fbc34391c653b616e4b"), BigNumber.from("0x1c4dce387444bdeed57682f4d1998c0e62569fd5503f713e133231ce215c41bc")],
        [BigNumber.from("0x120d8c4c7bdc8f4efdb72474546a20672483a14d76d1146cebaad710ac1c6afe"), BigNumber.from("0x0c790c4c5fe6fde581d4e7ab5cb7dff1a498b659c23b029029899db2d663e147")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x09c101eabe20c77d54776dca3a67fb874db51c9d9cc1906ca3c5ffaf849a9977"), BigNumber.from("0x10bc6135475cda1f8ffc0bb0a6abc274c8bfbdad6d0d12498cc5a3b820d0db84")];
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
      return await receiveProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await receiveProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
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
        await keyHashAdapter.setVenmoMailserverKeyHash(ZERO_BYTES32);
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
        await expect(subject()).to.be.revertedWith("Email has already been used");
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
    let subjectVenmoMailserverKeyHashAdapter: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVenmoMailserverKeyHashAdapter = attacker.address;
    });

    async function subject(): Promise<any> {
      return await receiveProcessor.connect(subjectCaller.wallet).setVenmoMailserverKeyHashAdapter(subjectVenmoMailserverKeyHashAdapter);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHashAdapter = await receiveProcessor.venmoMailserverKeyHashAdapter();
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
