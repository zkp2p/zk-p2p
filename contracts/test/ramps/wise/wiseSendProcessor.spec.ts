import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { NullifierRegistry, WiseSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Address, TLSParams, WiseSendProof } from "@utils/types";
import { calculateWiseId } from "@utils/protocolUtils";
import { usdc } from "@utils/common";

const expect = getWaffleExpect();
const abiCoder = new ethers.utils.AbiCoder();

describe("WiseSendProcessor", () => {
  let owner: Account;
  let verifier: Account;
  let attacker: Account;
  let ramp: Account;

  let nullifierRegistry: NullifierRegistry;
  let registrationProcessor: WiseSendProcessor;

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

    // tlsParams = {
    //   verifierSigningKey: verifier.address,
    // };

    registrationProcessor = await deployer.deployWiseSendProcessor(
      ramp.address,
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

      expect(rampAddress).to.eq(ramp.address);
      expect(nullifierRegistryAddress).to.eq(nullifierRegistry.address);
    });
  });

  describe("#processProof", async () => {
    let subjectProof: WiseSendProof;
    let subjectCaller: Account;

    beforeEach(async () => {

      subjectProof = {
        public_values: {
          endpoint: "GET https://wise.com/gateway/v3/profiles/41213881/transfers",
          host: "wise.com",
          transferId: "981609478",
          senderId: "41213881",
          recipientId: "740362059",
          timestamp: "1709140561000",
          currencyId: "SGD",
          amount: "9.0",
          status: "OUTGOING_PAYMENT_SENT",
          intentHash: "12345",
        },
        verifierSigningKey: verifier.address,
        proof: "0xe490922cc46624fe055c3bee676cdd368067ca70c835b1ea9378251edaf140d7126cae0d6426ef8e1867efb874188ca6fc7798a20f2c130dcaa82bdb28aeb75d1c"
      } as WiseSendProof;

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const [
        amount,
        timestamp,
        offRamperId,
        onRamperId,
        intentHash,
        currencyId
      ] = await subjectCallStatic();
      
      expect(amount).to.eq(usdc(9));
      expect(timestamp).to.eq(BigNumber.from(subjectProof.public_values.timestamp).div(1000).add(30));
      expect(onRamperId).to.eq(calculateWiseId(subjectProof.public_values.senderId));
      expect(offRamperId).to.eq(calculateWiseId(subjectProof.public_values.recipientId));
      expect(intentHash).to.eq(calculateWiseId(subjectProof.public_values.intentHash));   // Use the same method as Id to encode intent hash
      expect(currencyId).to.eq(ethers.utils.solidityKeccak256(["string"], [subjectProof.public_values.currencyId]));
    });

    it("should add the hash of the proof inputs to the nullifier registry", async () => {
      await subject();

      const expectedNullifier = ethers.utils.solidityKeccak256(
        ["string", "string"],
        ["Wise", subjectProof.public_values.transferId]
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
        subjectProof.public_values.senderId = "555555555"
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid signature from verifier");
      });
    });

    describe("when the TLS proof is for a different endpoint", async () => {
      beforeEach(async () => {
        subjectProof.public_values.endpoint = "GET https://wise.com/gateway/v4/profiles/41213881";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "string", "string", "string", "string", "string", "string", "string"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.transferId,
            subjectProof.public_values.senderId,
            subjectProof.public_values.recipientId,
            subjectProof.public_values.amount,
            subjectProof.public_values.currencyId,
            subjectProof.public_values.status,
            subjectProof.public_values.timestamp,
            subjectProof.public_values.intentHash
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
          ["string", "string", "string", "string", "string", "string", "string", "string", "string", "string"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.transferId,
            subjectProof.public_values.senderId,
            subjectProof.public_values.recipientId,
            subjectProof.public_values.amount,
            subjectProof.public_values.currencyId,
            subjectProof.public_values.status,
            subjectProof.public_values.timestamp,
            subjectProof.public_values.intentHash
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
