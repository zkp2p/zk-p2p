import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { NullifierRegistry, WiseAccountRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Address, WiseRegistrationData, WiseRegistrationProof } from "@utils/types";
import { calculateWiseId, calculateWiseTagHash } from "@utils/protocolUtils";

const expect = getWaffleExpect();
const abiCoder = new ethers.utils.AbiCoder();

describe("WiseAccountRegistrationProcessor", () => {
  let owner: Account;
  let verifier: Account;
  let attacker: Account;
  let ramp: Account;

  let nullifierRegistry: NullifierRegistry;
  let registrationProcessor: WiseAccountRegistrationProcessor;

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

    registrationProcessor = await deployer.deployWiseAccountRegistrationProcessor(
      ramp.address,
      verifier.address,
      nullifierRegistry.address,
      "POST https://wise.com/gateway/v1/payments",
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

      expect("POST https://wise.com/gateway/v1/payments").to.deep.equal(actualEndpoint);
      expect(verifier.address).to.deep.equal(actualVerifier);
      expect("wise.com").to.deep.equal(actualHost);
    });
  });

  describe("#processProof", async () => {
    let subjectProof: WiseRegistrationProof;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = {
        public_values: {
          endpoint: "POST https://wise.com/gateway/v1/payments",
          host: "wise.com",
          profileId: "41213881",
          wiseTagHash: "61158579531006309039872672420732308054473459091416465738091051601559791768344",
          userAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        } as WiseRegistrationData,
        proof: "0xe8d9937381ea1a4e4079d1007edc3d63fbeeb62b5759c9259f1c11b671ef8b7014fb621bea79abfe22aa3d29a77d2601adb25b55890c2f3e1f9f436870d549b61b"
      } as WiseRegistrationProof;

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const [ onRamperId, wiseTagHash ] = await subjectCallStatic();

      expect(onRamperId).to.eq(calculateWiseId(subjectProof.public_values.profileId));
      expect(wiseTagHash).to.eq(BigNumber.from(subjectProof.public_values.wiseTagHash).toHexString());
    });

    it("should add the hash of the proof inputs to the nullifier registry", async () => {
      await subject();

      const expectedNullifier = ethers.utils.keccak256(
        abiCoder.encode(
          ["address", "string"],
          [subjectProof.public_values.userAddress, subjectProof.public_values.profileId]
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
        subjectProof.public_values.wiseTagHash = calculateWiseTagHash("snakamoto1234");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid signature from verifier");
      });
    });

    describe("when the TLS proof is for a different endpoint", async () => {
      beforeEach(async () => {
        subjectProof.public_values.endpoint = "GET https://wise.com/gateway/v4/profiles/41213881";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "string", "address"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
            subjectProof.public_values.wiseTagHash,
            subjectProof.public_values.userAddress
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
          ["string", "string", "string", "string", "address"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
            subjectProof.public_values.wiseTagHash,
            subjectProof.public_values.userAddress
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
