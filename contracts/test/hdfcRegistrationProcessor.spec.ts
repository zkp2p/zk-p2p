import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapter, NullifierRegistry, HDFCRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { ZERO_BYTES32 } from "@utils/constants";
import { Address } from "@utils/types";

const expect = getWaffleExpect();

const rawSignals = ["0x06b0ad846d386f60e777f1d11b82922c6bb694216eed9c23535796ac404a7dfa","0x0000000000000000000000000000000000000000000000000040737472656c61","0x000000000000000000000000000000000000000000000000006e616263666468","0x00000000000000000000000000000000000000000000000000000074656e2e6b","0x1614e07f4a19701189ca2f7d653a911219b7c34f7a89fc00dc6928d74ef1b4d0"];

describe("HDFCRegistrationProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapter;
  let nullifierRegistry: NullifierRegistry;
  let registrationProcessor: HDFCRegistrationProcessor;

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
    registrationProcessor = await deployer.deployHDFCRegistrationProcessor(
      ramp.address,
      keyHashAdapter.address,
      nullifierRegistry.address,
      "alerts@hdfcbank.net"
    );
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await registrationProcessor.ramp();
      const venmoMailserverKeyHashAdapter = await registrationProcessor.mailserverKeyHashAdapter();
      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

      expect(rampAddress).to.eq(ramp.address);
      expect(venmoMailserverKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
      expect(ethers.utils.toUtf8Bytes("alerts@hdfcbank.net")).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });
  });

  describe("#processProof", async () => {
    let subjectProof: any;
    let subjectCaller: Account;

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x2f118abcb4d8c83f8f7364c45362178d7aff8115d123ce8f836b199ebf8c6a36"), BigNumber.from("0x2d4f3e1257be122ec9765452c01eebae8d425d4de0211d22b833b7fea3ddae65")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x25fb3523b5c9d2108539b0ade72397cd4ad9b33fc0a3c363c5d0276f96cf5350"), BigNumber.from("0x0aff3ec34723abc069da98e29d149d81d1dfafbf50f1e3109d9607371356974c")],
        [BigNumber.from("0x04660e0440663573c6a8bccf8ed9fa7055cee159dd849fb1b0da28b2dd9b3ffd"), BigNumber.from("0x04153846129279ebe40924b2de345472013e6c2796fdca63e1a2144b973e71a4")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x2a426eb89f24471643e7cf474aadeb0833dc99bfd133ff025fc9595e72cd60ff"), BigNumber.from("0x12113ed90ded0fd9f8bcfb7d25cbba712a58447b874ceb78c671177f172d4f78")];
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
        await registrationProcessor.setEmailFromAddress("bad-alerts@hdfcbank.net".padEnd(21, "\0"));
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

      subjectEmailFromAddress = "new-alerts@hdfcbank.net".padEnd(21, "\0");
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("new-alerts@hdfcbank.net".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
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
