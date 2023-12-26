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
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x191e1b9bc41df5af8ee340c17b985e6568d07af205081006b58b051cfcb69747"), BigNumber.from("0x12bf495fd858d78c2c1afe44a54c1e2e14816bb08e38d65ad7e433097330b3da")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x3045cf6ba2aa61bc7b601e7d7a8ad40e4934e206e8e6649f28bf2bab5633539b"), BigNumber.from("0x12942590fa042c1852458a02ec03382fe954f41817bee90d00000f7c58813bbc")],
        [BigNumber.from("0x22d6aaad8804724c0103be2ebce7168375f960d61169b9f3df2dcb269ed1e91a"), BigNumber.from("0x21afcce7edba700acadad481d70b3b987c6d66affee80165e9e37fc473e1cfe5")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x16c20e8962dccf386104148cf396cff59eb91df62e9b809f3844773901e360cb"), BigNumber.from("0x1a086c71446c21cb5a114200211bd69c87095f750cf09726ab50f8ad551ff911")];
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
