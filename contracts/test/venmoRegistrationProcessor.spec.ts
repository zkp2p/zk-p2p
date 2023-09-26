import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { VenmoRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { ZERO_BYTES32 } from "@utils/constants";
import { GrothProof } from "@utils/types";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0f176a538d8c9a4bcea381f5711c7dc92a87f8a3e6a790e1a13d92e1b2617798"];

describe("VenmoRegistrationProcessor", () => {
  let owner: Account;
  let attacker: Account;

  let registrationProcessor: VenmoRegistrationProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    registrationProcessor = await deployer.deployVenmoRegistrationProcessor(
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
      return await deployer.deployVenmoRegistrationProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await registrationProcessor.venmoMailserverKeyHash();
      expect(venmoKeys).to.deep.equal(rawSignals[0]);
    });

    it("should set the correct email from address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

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
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x0c797f42dd6924f80d56ba7fe265b3ef92ac2638d55d5467393e968c9d7b8bac"), BigNumber.from("0x24ebff79876e5c0a5b414fc457ab8ecbed5edeb004418f84a3aeaee61c31e102")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x041186fb4637f1978fc39e8b54977d145565822f0b10837eea242bc347dc0c52"), BigNumber.from("0x18a636ce289824c1b5e0f0df21eba51609bc52ec9e01913912bcac5cb4ddf9cd")],
        [BigNumber.from("0x1a12e6683af60ef49bc366b38d64cf45f39577c880554f87da3d1cba49c134a6"), BigNumber.from("0x1d1e2457b5d55612c40924613553bc0751c671e91f04b2236efbbbbc9db75be3")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x04f4638d6d80d269807e3ff739dc81910e86dd2c17cbbd72fe23449609b5a4f5"), BigNumber.from("0x191b8672ecf45f38b11f233d239cb32887af779dd39cb0c7f163d0da18636608")];
      const signals: BigNumber[] = rawSignals.map((signal) => BigNumber.from(signal));

      subjectProof = {
        a,
        b,
        c,
        signals
      };
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const onRamperIdHash = await subject();

      expect(onRamperIdHash).to.eq(subjectProof.signals[7]);
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
        await registrationProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(42, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await registrationProcessor.setVenmoMailserverKeyHash(ZERO_BYTES32);
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
      return await registrationProcessor.connect(subjectCaller.wallet).setVenmoMailserverKeyHash(subjectVenmoMailserverKeyHash);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHash = await registrationProcessor.venmoMailserverKeyHash();
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
      return await registrationProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

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
