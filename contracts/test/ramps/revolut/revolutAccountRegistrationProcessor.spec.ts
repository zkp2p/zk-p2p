import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { NullifierRegistry, RevolutAccountRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Address, RevolutRegistrationData, RevolutRegistrationProof } from "@utils/types";

const expect = getWaffleExpect();
const abiCoder = new ethers.utils.AbiCoder();

describe("RevolutAccountRegistrationProcessor", () => {
  let owner: Account;
  let verifier: Account;
  let attacker: Account;
  let ramp: Account;

  let nullifierRegistry: NullifierRegistry;
  let registrationProcessor: RevolutAccountRegistrationProcessor;

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

    registrationProcessor = await deployer.deployRevolutAccountRegistrationProcessor(
      ramp.address,
      verifier.address,
      nullifierRegistry.address,
      "GET https://app.revolut.com/api/retail/user/current",
      "app.revolut.com"
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

      expect("GET https://app.revolut.com/api/retail/user/current").to.deep.equal(actualEndpoint);
      expect(verifier.address).to.deep.equal(actualVerifier);
      expect("app.revolut.com").to.deep.equal(actualHost);
    });
  });

  describe("#processProof", async () => {
    let subjectProof: RevolutRegistrationProof;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = {
        public_values: {
          endpoint: "GET https://app.revolut.com/api/retail/user/current",
          host: "app.revolut.com",
          profileId: "55990530848032332592411724135893856847123084097520685404734279999550883729894",
          userAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        } as RevolutRegistrationData,
        proof: "0x89744209cbc46ef9a472d18ae1405030cc996b7bad62dcb3042bbe837e4bdbf65438f59cad5500012f59e7c72e53edc94f2eaddcdfbf785bdd75292e37cceed91b"
      } as RevolutRegistrationProof;

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const onRamperId = await subjectCallStatic();

      expect(onRamperId).to.eq(BigNumber.from(subjectProof.public_values.profileId).toHexString());
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
        subjectProof.public_values.profileId = "55990530848032332592411724135893856847123084097520685404734279999550883729893";
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid signature from verifier");
      });
    });

    describe("when the TLS proof is for a different endpoint", async () => {
      beforeEach(async () => {
        subjectProof.public_values.endpoint = "GET https://app.revolut.com/api/business/user/current";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "address"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
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
        subjectProof.public_values.host = "api.revolut.com";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "address"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
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
