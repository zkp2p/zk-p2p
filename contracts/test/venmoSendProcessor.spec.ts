import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapter, NullifierRegistry, VenmoSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { Address, GrothProof } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x00000000000000000000000000000000000000000000000000000030302e3033","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000033373633383631","0x0000000000000000000000000000000000000000000000000000000000393334","0x14465b905804512ffd4ed3425fd0d9d0f50947bddfd35bb55be9c29cca1e1c3a","0x0741728e3aae72eda484e8ccbf00f843c38eae9c399b9bd7fb2b5ee7a055b6bf","0x1e1d37257be43685d944597f63d00a6b638b9b4ff1752cf8db9c5de48ececbe8","0x0000000000000000000000000000000000000000000000000000000000003039"];

describe("VenmoSendProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapter;
  let nullifierRegistry: NullifierRegistry;
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
    nullifierRegistry = await deployer.deployNullifierRegistry();
    sendProcessor = await deployer.deployVenmoSendProcessor(
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
      const venmoKeyHashAdapter = await sendProcessor.mailserverKeyHashAdapter();
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
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x2a1eba4b96b534094d82a3b5624bb750af53aae2d21b90fbbe239d145b8983fd"), BigNumber.from("0x12e8698eac09b6b7861a168099242a8b3044c6b7720b4f453101a274bbdb2b94")]
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x25a5073001984435c489b3318e07b93d1755a763889a734fb8cd2f6bb713006a"), BigNumber.from("0x1561b6ebd796ecc5b52cc6e6f7226f5c0a20e952cc4d1dcd0b3a3e23e116cf23")],
        [BigNumber.from("0x2400aa61e06f1b046d184a33e44132ef2d3995f533e4967396cf9e59a5569747"), BigNumber.from("0x10f9d78505a387a15ad9b7bef2c5df65d349f31f2c396a6710dd4dfa1d8188a3")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x16492a341213d631c1d4edc4297c8b05a568be4e61ff7da61226e0e84f53fd1d"), BigNumber.from("0x1918f19b5cbed64abf968a3994b80f164c84681b4fe6cddbfe3e680b0e2d32bd")];
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
        onRamperIdHash,
        intentHash
      } = await subjectCallStatic();

      expect(amount).to.eq(usdc(30));
      expect(timestamp).to.eq(BigNumber.from(1683673439));
      expect(offRamperIdHash).to.eq(rawSignals[8]);
      expect(onRamperIdHash).to.eq(rawSignals[9]);
      expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000003039");
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
