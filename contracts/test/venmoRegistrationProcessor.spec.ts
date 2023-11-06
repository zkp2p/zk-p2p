import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapter, NullifierRegistry, VenmoRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { ZERO_BYTES32 } from "@utils/constants";
import { Address } from "@utils/types";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0741728e3aae72eda484e8ccbf00f843c38eae9c399b9bd7fb2b5ee7a055b6bf"];

describe("VenmoRegistrationProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapter;
  let nullifierRegistry: NullifierRegistry;
  let registrationProcessor: VenmoRegistrationProcessor;

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
    registrationProcessor = await deployer.deployVenmoRegistrationProcessor(
      ramp.address,
      keyHashAdapter.address,
      nullifierRegistry.address,
      "venmo@venmo.com"
    );
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await registrationProcessor.ramp();
      const venmoMailserverKeyHashAdapter = await registrationProcessor.mailserverKeyHashAdapter();
      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

      expect(rampAddress).to.eq(ramp.address);
      expect(venmoMailserverKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
      expect(ethers.utils.toUtf8Bytes("venmo@venmo.com")).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });
  });

  describe("#processProof", async () => {
    let subjectProof: any;
    let subjectCaller: Account;

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x2ec1c16f1059e93453cac82c862c5501aaf3f710c5f23304471086c092eea31d"), BigNumber.from("0x2ee2e1580d07b81de93485e4c5739ad0fce01cd746d74ae6d38aed0e69d1a0d4")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x09c9cc6565b20781dff26c1dcde589b6d9c2c10f5fdc9036dc2882342926c2fc"), BigNumber.from("0x1c2cb4270920c8747770a89a21cbe00ed1048d9f668ce711aa792d8464fa28d1")],
        [BigNumber.from("0x00b1bc7261a4992e2396426285280d9c203e222d825bad49d15abff94cf68c66"), BigNumber.from("0x0e7e7432c90ce467211ec31d610b219252f385938053caa2c7054e9f1f5ff209")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x2f756bb42c2f70b554a9af6163056267f93a40396071ed0e676f916e100609a6"), BigNumber.from("0x1194696954bdc306464b86e5645bf096d03f3600e599cbca76dad98aff87893a")];
      const signals: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] = [BigNumber.from(rawSignals[0]), BigNumber.from(rawSignals[1]), BigNumber.from(rawSignals[2]), BigNumber.from(rawSignals[3]), BigNumber.from(rawSignals[4])];

      subjectProof = {
        a,
        b,
        c,
        signals
      };
      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const onRamperIdHash = await subject();

      expect(onRamperIdHash).to.eq(subjectProof.signals[4]);
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
        await registrationProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(21, "\0"));
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
    let subjectVenmoMailserverKeyHashAdapter: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVenmoMailserverKeyHashAdapter = attacker.address;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setMailserverKeyHashAdapter(subjectVenmoMailserverKeyHashAdapter);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHashAdapter = await registrationProcessor.mailserverKeyHashAdapter();
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
      return await registrationProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

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
