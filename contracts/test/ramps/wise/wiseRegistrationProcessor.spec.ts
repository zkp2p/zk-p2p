import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { NullifierRegistry, WiseRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Address, TLSParams, WiseOffRamperRegistrationProof, WiseRegistrationProof } from "@utils/types";
import { calculateWiseId, calculateWiseTagHash } from "@utils/protocolUtils";

const expect = getWaffleExpect();
const abiCoder = new ethers.utils.AbiCoder();

describe("WiseRegistrationProcessor", () => {
  let owner: Account;
  let notary: Account;
  let attacker: Account;
  let ramp: Account;

  let nullifierRegistry: NullifierRegistry;
  let registrationProcessor: WiseRegistrationProcessor;

  let deployer: DeployHelper;

  let accountTLSParams: TLSParams;
  let offRamperTLSParams: TLSParams;

  beforeEach(async () => {
    [
      notary,
      owner,
      attacker,
      ramp
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    nullifierRegistry = await deployer.deployNullifierRegistry();

    accountTLSParams = {
      notary: notary.address,
      endpoint: "POST https://wise.com/gateway/v1/payments",
      host: "wise.com",
    };

    offRamperTLSParams = {
      notary: notary.address,
      endpoint: "GET https://wise.com/gateway/v3/profiles/*/transfers",
      host: "wise.com",
    };
    registrationProcessor = await deployer.deployWiseRegistrationProcessor(
      ramp.address,
      nullifierRegistry.address,
      accountTLSParams,
      offRamperTLSParams
    );

    await nullifierRegistry.connect(owner.wallet).addWritePermission(registrationProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await registrationProcessor.ramp();
      const nullifierRegistryAddress = await registrationProcessor.nullifierRegistry();
      const actualAccountTLSParams = await registrationProcessor.getAccountTLSParams();
      const actualOffRamperTLSParams = await registrationProcessor.getOffRamperTLSParams();

      expect(rampAddress).to.eq(ramp.address);
      expect(nullifierRegistryAddress).to.eq(nullifierRegistry.address);

      expect(accountTLSParams.endpoint).to.deep.equal(actualAccountTLSParams.endpoint);
      expect(accountTLSParams.notary).to.deep.equal(actualAccountTLSParams.notary);
      expect(accountTLSParams.host).to.deep.equal(actualAccountTLSParams.host);

      expect(offRamperTLSParams.endpoint).to.deep.equal(actualOffRamperTLSParams.endpoint);
      expect(offRamperTLSParams.notary).to.deep.equal(actualOffRamperTLSParams.notary);
      expect(offRamperTLSParams.host).to.deep.equal(actualOffRamperTLSParams.host);
    });
  });

  describe("#processAccountProof", async () => {
    let subjectProof: WiseRegistrationProof;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = {
        public_values: {
          endpoint: "POST https://wise.com/gateway/v1/payments",
          host: "wise.com",
          profileId: "41213881",
          wiseTagHash: "61158579531006309039872672420732308054473459091416465738091051601559791768344"
        },
        proof: "0xba03085b486a2f7bab46cef658ea930b2be69368a3f1d547d0afc99ef382cda0384e6e80a15a832c7416dc5882e9b5e05c16c6f33885a4c5794f1e1a058605831b"
      } as WiseRegistrationProof;

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).processAccountProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).callStatic.processAccountProof(subjectProof);
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
          ["string", "string"],
          ["registration", subjectProof.public_values.profileId]
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
        await expect(subject()).to.be.revertedWith("Invalid signature from notary");
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
            subjectProof.public_values.wiseTagHash
          ]
        );

        subjectProof.proof = await notary.wallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(encodedMsg)));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Passed endpoint doesn't match expected");
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
            subjectProof.public_values.wiseTagHash
          ]
        );

        subjectProof.proof = await notary.wallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(encodedMsg)));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Passed host doesn't match expected");
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
        await expect(subject()).to.be.revertedWith("Invalid signature from notary");
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

        subjectProof.proof = await notary.wallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(encodedMsg)));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Passed endpoint doesn't match expected");
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

        subjectProof.proof = await notary.wallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(encodedMsg)));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Passed host doesn't match expected");
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

  describe("#setAccountTLSParams", async () => {
    let subjectTLSParams: TLSParams;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectTLSParams = {
        notary: notary.address,
        endpoint: "POST https://wise.com/gateway/v2/payments",
        host: "api.wise.com",
      };
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setAccountTLSParams(subjectTLSParams);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const actualTLSParams = await registrationProcessor.getAccountTLSParams();

      expect(actualTLSParams.endpoint).to.equal(subjectTLSParams.endpoint);
      expect(actualTLSParams.notary).to.equal(subjectTLSParams.notary);
      expect(actualTLSParams.host).to.equal(subjectTLSParams.host);
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

  describe("#setOffRamperTLSParams", async () => {
    let subjectTLSParams: TLSParams;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectTLSParams = {
        notary: notary.address,
        endpoint: "GET https://wise.com/gateway/v4/profiles/41213881/transfers",
        host: "api.wise.com",
      };
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setOffRamperTLSParams(subjectTLSParams);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const actualTLSParams = await registrationProcessor.getOffRamperTLSParams();

      expect(actualTLSParams.endpoint).to.equal(subjectTLSParams.endpoint);
      expect(actualTLSParams.notary).to.equal(subjectTLSParams.notary);
      expect(actualTLSParams.host).to.equal(subjectTLSParams.host);
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
