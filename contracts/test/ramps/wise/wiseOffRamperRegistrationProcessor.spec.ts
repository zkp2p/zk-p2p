import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { NullifierRegistry, WiseOffRamperRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Address, WiseOffRamperRegistrationProof } from "@utils/types";
import { calculateWiseId } from "@utils/protocolUtils";

const expect = getWaffleExpect();
const abiCoder = new ethers.utils.AbiCoder();

describe("WiseOffRamperRegistrationProcessor", () => {
  let owner: Account;
  let verifier: Account;
  let attacker: Account;
  let ramp: Account;

  let nullifierRegistry: NullifierRegistry;
  let registrationProcessor: WiseOffRamperRegistrationProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      verifier,
      owner,
      attacker,
      ramp
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    nullifierRegistry = await deployer.deployNullifierRegistry();

    registrationProcessor = await deployer.deployWiseOffRamperRegistrationProcessor(
      ramp.address,
      verifier.address,
      nullifierRegistry.address,
      "GET https://wise.com/gateway/v3/profiles/*/transfers",
      "wise.com"
    );

    await nullifierRegistry.connect(owner.wallet).addWritePermission(registrationProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await registrationProcessor.ramp();
      const nullifierRegistryAddress = await registrationProcessor.nullifierRegistry();
      const actualVerifier = await registrationProcessor.verifierSigningKey();
      const actualEndpoint = await registrationProcessor.endpoint();
      const actualHost = await registrationProcessor.host();

      expect(rampAddress).to.eq(ramp.address);
      expect(nullifierRegistryAddress).to.eq(nullifierRegistry.address);

      expect("GET https://wise.com/gateway/v3/profiles/*/transfers").to.deep.equal(actualEndpoint);
      expect(verifier.address).to.deep.equal(actualVerifier);
      expect("wise.com").to.deep.equal(actualHost);
    });
  });

  describe("#processOffRamperProof", async () => {
    let subjectProof: WiseOffRamperRegistrationProof;
    let subjectCaller: Account;

    beforeEach(async () => {

      subjectProof = {
        public_values: {
          endpoint: "GET https://wise.com/gateway/v3/profiles/41213881/transfers",
          host: "wise.com",
          profileId: "41213881",
          mcAccountId: "402863684"
        },
        proof: "0xf7f5982ae351d80e6be4029899d152a43ad554380bd4aa9a335316f11757003423209e545af86c2835ebcb4e6b5ff60748a49e3bc73129772f04f633c2fe989c1b"
      } as WiseOffRamperRegistrationProof;

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).processOffRamperProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).callStatic.processOffRamperProof(subjectProof);
    }

    it("should process the proof", async () => {
      const [ onRamperId, offRamperId ] = await subjectCallStatic();
      
      expect(onRamperId).to.eq(calculateWiseId(subjectProof.public_values.profileId));
      expect(offRamperId).to.eq(calculateWiseId(subjectProof.public_values.mcAccountId));
    });

    it("should add the hash of the proof inputs to the nullifier registry", async () => {
      await subject();

      const expectedNullifier = ethers.utils.keccak256(
        abiCoder.encode(
          ["string", "string"],
          ["registration", subjectProof.public_values.mcAccountId]
        )
      );

      const isNullified = await nullifierRegistry.isNullified(expectedNullifier);

      expect(isNullified).to.be.true;
    });

    describe("when the profile has already been verified", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Nullifier has already been used");
      });
    });

    describe("when the proof is invalid", async () => {
      beforeEach(async () => {
        subjectProof.public_values.mcAccountId = "555555555"
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid signature from verifier");
      });
    });

    describe("when the TLS proof is for a different endpoint", async () => {
      beforeEach(async () => {
        subjectProof.public_values.endpoint = "GET https://wise.com/gateway/v4/profiles/41213881";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "string"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
            subjectProof.public_values.mcAccountId
          ]
        );

        subjectProof.proof = await verifier.wallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(encodedMsg)));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Endpoint does not match expected");
      });
    });

    describe("when the host doesn't match", async () => {
      beforeEach(async () => {
        subjectProof.public_values.host = "api.wise.com";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "string"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
            subjectProof.public_values.mcAccountId
          ]
        );

        subjectProof.proof = await verifier.wallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(encodedMsg)));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Host does not match expected");
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

  describe("#setVerifierSigningKey", async () => {
    let subjectVerifierSigningKey: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVerifierSigningKey = verifier.address;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setVerifierSigningKey(subjectVerifierSigningKey);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const actualVerifier = await registrationProcessor.verifierSigningKey();

      expect(actualVerifier).to.equal(subjectVerifierSigningKey);
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

  describe("#setTimestampBuffer", async () => {
    let subjectTimestampBuffer: BigNumber;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectTimestampBuffer = BigNumber.from(60);
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setTimestampBuffer(subjectTimestampBuffer);
    }

    it("should set the timestamp buffer", async () => {
      await subject();

      const timestampBuffer = await registrationProcessor.timestampBuffer();

      expect(subjectTimestampBuffer).to.deep.equal(timestampBuffer);
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
