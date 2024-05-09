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
      "0x166338393593e85bfde8B65358Ec5801A3445D12",
      BigNumber.from("113116629262703480258914951290401242193028831780154554089583031844538369800942").toHexString(),
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
      const actualNotaryKeyHash = await registrationProcessor.notaryKeyHash();

      expect(rampAddress).to.eq(ramp.address);
      expect(nullifierRegistryAddress).to.eq(nullifierRegistry.address);
      expect(actualNotaryKeyHash).to.eq(BigNumber.from("113116629262703480258914951290401242193028831780154554089583031844538369800942").toHexString(),);
      expect("GET https://app.revolut.com/api/retail/user/current").to.deep.equal(actualEndpoint);
      expect("0x166338393593e85bfde8B65358Ec5801A3445D12").to.deep.equal(actualVerifier);
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
          profileId: "21441300878620834626555326528464320548303703202526115662730864900894611908769",
          userAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          notaryKeyHash: BigNumber.from("113116629262703480258914951290401242193028831780154554089583031844538369800942")
        } as RevolutRegistrationData,
        proof: "0x0517fbc6fc6738b6ad1c0c638f635f4ad4e01616b92bb87b102fe9000c5b58f27eda7bf373636af301fbfaaf3b6f267d82ca0ec8b089cbd4d42159e1a957cdc11b"
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
        await expect(subject()).to.be.revertedWith("Invalid proof");
      });
    });

    describe("when the notary key hash doesn't match", async () => {
      beforeEach(async () => {
        subjectProof.public_values.notaryKeyHash = BigNumber.from("55990530848032332592411724135893856847123084097520685404734279999550883729893");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid notary key hash");
      });
    });

    describe("when the TLS proof is for a different endpoint", async () => {
      beforeEach(async () => {
        subjectProof.public_values.endpoint = "GET https://app.revolut.com/api/business/user/current";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "address", "uint256"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
            subjectProof.public_values.userAddress,
            subjectProof.public_values.notaryKeyHash
          ]
        );

        await registrationProcessor.connect(owner.wallet).setVerifierSigningKey(verifier.address);
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
          ["string", "string", "string", "address", "uint256"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.profileId,
            subjectProof.public_values.userAddress,
            subjectProof.public_values.notaryKeyHash
          ]
        );

        await registrationProcessor.connect(owner.wallet).setVerifierSigningKey(verifier.address);
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

      subjectVerifierSigningKey = "0x166338393593e85bfde8B65358Ec5801A3445D12";
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
