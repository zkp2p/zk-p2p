import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { NullifierRegistry, RevolutSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Address, RevolutSendData, RevolutSendProof } from "@utils/types";
import { usdc } from "@utils/common";

const expect = getWaffleExpect();
const abiCoder = new ethers.utils.AbiCoder();

describe("RevolutSendProcessor", () => {
  let owner: Account;
  let verifier: Account;
  let attacker: Account;
  let ramp: Account;

  let nullifierRegistry: NullifierRegistry;
  let sendProcessor: RevolutSendProcessor;

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

    sendProcessor = await deployer.deployRevolutSendProcessor(
      ramp.address,
      nullifierRegistry.address,
      "GET https://app.revolut.com/api/retail/transaction/*",
      "app.revolut.com"
    );

    await nullifierRegistry.connect(owner.wallet).addWritePermission(sendProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await sendProcessor.ramp();
      const nullifierRegistryAddress = await sendProcessor.nullifierRegistry();

      expect(rampAddress).to.eq(ramp.address);
      expect(nullifierRegistryAddress).to.eq(nullifierRegistry.address);
    });
  });

  describe("#processProof", async () => {
    let subjectProof: RevolutSendProof;
    let subjectVerifierSigningKey: Address;
    let subjectCaller: Account;

    beforeEach(async () => {

      subjectProof = {
        public_values: {
          endpoint: 'GET https://app.revolut.com/api/retail/transaction/65fd0142-7155-a0b7-8136-86e1fcc5455e',
          host: "app.revolut.com",
          transferId: "65fd0142-7155-a0b7-8136-86e1fcc5455e",
          recipientId: "alexgx7gy",
          amount: "-100",
          currencyId: "EUR",
          status: "COMPLETED",
          timestamp: "1711079746280",
          intentHash: BigNumber.from("2109098755843864455034980037347310810989244226703714011137935097150268285982"),
        } as RevolutSendData,
        proof: "0x1a6db4989f793387da4045ea28c33cfa4e1cdc68f32637ff221f8c1dd785d4d559803367c00264de10b337f5c38db58cfb447e305ae5ec48a3ec3cd35943a0711b"
      } as RevolutSendProof;

      subjectVerifierSigningKey = verifier.address;

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).processProof(subjectProof, subjectVerifierSigningKey);
    }

    async function subjectCallStatic(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof, subjectVerifierSigningKey);
    }

    it("should process the proof", async () => {
      const [
        amount,
        timestamp,
        offRamperId,
        currencyId
      ] = await subjectCallStatic();

      expect(amount).to.eq(usdc(100));
      expect(timestamp).to.eq(BigNumber.from(subjectProof.public_values.timestamp).div(1000).add(30));
      expect(offRamperId).to.eq(ethers.utils.solidityKeccak256(["string"], [subjectProof.public_values.recipientId]));
      expect(currencyId).to.eq(ethers.utils.solidityKeccak256(["string"], [subjectProof.public_values.currencyId]));
    });

    it("should add the hash of the proof inputs to the nullifier registry", async () => {
      await subject();

      const expectedNullifier = ethers.utils.solidityKeccak256(
        ["string", "string"],
        ["Revolut", subjectProof.public_values.transferId]
      );

      const isNullified = await nullifierRegistry.isNullified(expectedNullifier);

      expect(isNullified).to.be.true;
    });

    describe("when the transfer has already been used", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Nullifier has already been used");
      });
    });

    describe("when the proof is invalid", async () => {
      beforeEach(async () => {
        subjectVerifierSigningKey = attacker.address;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid signature from verifier");
      });
    });

    describe("when the payment status is not OUTGOING_PAYMENT_SENT", async () => {
      beforeEach(async () => {
        subjectProof.public_values.status = "PENDING";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "string", "string", "string", "string", "string", "uint256"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.transferId,
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
        await expect(subject()).to.be.revertedWith("Payment status not confirmed as sent");
      });
    });

    describe("when the amount is not preceeded by a -", async () => {
      beforeEach(async () => {
        subjectProof.public_values.amount = "100"

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "string", "string", "string", "string", "string", "uint256"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.transferId,
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
        await expect(subject()).to.be.revertedWith("Not a send transaction");
      });
    });

    describe("when the TLS proof is for a different endpoint", async () => {
      beforeEach(async () => {
        subjectProof.public_values.endpoint = "GET https://wise.com/gateway/v4/profiles/41213881";

        const encodedMsg = abiCoder.encode(
          ["string", "string", "string", "string", "string", "string", "string", "string", "uint256"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.transferId,
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
          ["string", "string", "string", "string", "string", "string", "string", "string", "uint256"],
          [
            subjectProof.public_values.endpoint,
            subjectProof.public_values.host,
            subjectProof.public_values.transferId,
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
      return await sendProcessor.connect(subjectCaller.wallet).setTimestampBuffer(subjectTimestampBuffer);
    }

    it("should set the timestamp buffer", async () => {
      await subject();

      const timestampBuffer = await sendProcessor.timestampBuffer();

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
