import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapterV2, NullifierRegistry, GarantiBodyHashVerifier, GarantiSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { GrothProof } from "@utils/types";
import { calculateIbanHash, createTypedGarantiBodyHashProof, createTypedSendProof, unpackPackedGarantiId } from "@utils/protocolUtils";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";

const expect = getWaffleExpect();

const rawSignals = ["0x03a9c8babd6b4ad94d711f3ffbee84b7aa69f4cb0dd08d491c5a5c32eca15f60","0x000000000000000000000000000000000de437f1a84c19f842cf57e8050277ee","0x0000000000000000000000000000000085fb4e44aa54c94873414ecbf4487122","0x00000000000000000000000000000000ec2c7e8ebdd0cf3ecdbd2a47c25f6882","0x000000000000000000000000000000007d1c9c7f962023b3b2ce05fc22905b9b","0x0000000000000000000000000000000000000000000000000069746e61726167","0x00000000000000000000000000000000000000000000000000672e6f666e6940","0x000000000000000000000000000000000000000000000000006269746e617261","0x000000000000000000000000000000000000000000000000006d6f632e617662","0x000000000000000000000000000000000000000000000000000000000072742e","0x0000000000000000000000000000000000000000000000000036313433303731","0x0000000000000000000000000000000000000000000000000000000000313638","0x0000000000000000000000000000000000000000000000000030302031345254","0x0000000000000000000000000000000000000000000000000031313030203130","0x0000000000000000000000000000000000000000000000000030203437353620","0x0000000000000000000000000000000000000000000000000035333720373437","0x0000000000000000000000000000000000000000000000000000000035302030","0x000000000000000000000000000000000000000000000000000030302c303038","0x0000000000000000000000000000000000000000000000000000000000000000","0x071caee57e1bb6d2542fffa8b70fdd31f73ce937e8aa12735701d2481b7b0228","0x1234815a8ff6956b9b13bbc40073354659eb0ed3e1c1c271be7315d25a3e9105","0x0000000000000000000000000000000000000000000000000000000000003039"];

describe("GarantiSendProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapterV2;
  let nullifierRegistry: NullifierRegistry;
  let bodyHashVerifier: GarantiBodyHashVerifier;
  let sendProcessor: GarantiSendProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
      ramp
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    keyHashAdapter = await deployer.deployManagedKeyHashAdapterV2([rawSignals[0]]);
    nullifierRegistry = await deployer.deployNullifierRegistry();
    bodyHashVerifier = await deployer.deployGarantiBodyHashVerifier();
    sendProcessor = await deployer.deployGarantiSendProcessor(
      ramp.address,
      keyHashAdapter.address,
      nullifierRegistry.address,
      bodyHashVerifier.address,
      "garanti@info.garantibbva.com.tr"
    );

    await nullifierRegistry.connect(owner.wallet).addWritePermission(sendProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await sendProcessor.ramp();
      const venmoKeyHashAdapter = await sendProcessor.mailServerKeyHashAdapter();
      const emailFromAddress = await sendProcessor.getEmailFromAddress();

      expect(rampAddress).to.eq(ramp.address);
      expect(venmoKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
      expect(ethers.utils.toUtf8Bytes("garanti@info.garantibbva.com.tr")).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });
  });

  describe("#processProof", async () => {
    let subjectProof: GrothProof;
    let subjectBodyHashProof: any;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = createTypedSendProof(
        ["0x0dc8f2891b315ac064ef74c169d0d8ac44f63c39eccf0170093e8485ed9e92bb", "0x151e64dd9470390e5eb7e94452dc4078c04cb9e476902fb2a7c69854d294345d"],
        [["0x105ecb7d06532f5e4e9e82ff16d9dc853430d964b237c359222167f4f86d41a6", "0x08ddfcc2d8c29702bc7952a65a4e2e0239daa18bb299ac3069aaf2ee8fb4d0d3"],["0x263ebeac2d88b084cb87983504db305ec811489db7c67aaca73188756cc42de7", "0x1b2f21517a257805ed0c1179080b6ae8fdfd2f997dc47054efcb7e2d75548a94"]],
        ["0x1c46a8acadeba9235863bb7e9145661c516988c39fe2b3de08fcde2e271746ad", "0x110a6249e23c8fe793cc6e8b63e4e7d3aab1d5c276f9d5e8a17b069944047071"],
        rawSignals
      );

      subjectBodyHashProof = createTypedGarantiBodyHashProof(
        ["0x2e4e61b91921f2598d1d62bdcc0d6db92176733fffbff0278d6f4b8f74410129", "0x1ec5e75f6fbe487a3c22e833b19748fe395659b9310da5c771339121f60a9836"],
        [["0x23a63c99ce250a9c24e9b7e39401e2b1f2649c6868508028d9a2c1c2c8ab6232", "0x2a3c9a61a4345a6ba24b3bbe99debec89ca99542879ab9f2ecd39279f2664fb2"],["0x164de92e0add3a56fd779022d2606f088e21c302bbdd18bd72d57fc193f4038a", "0x1521f487a3708e7e16649d398191b9e378cd5f18b593600b44ce87cd7dc69210"]],
        ["0x2e66d7f1c361ffc8b1201ae904321acc95717435ae2aff8f1822090496faee46", "0x3021feabfabed7c446ba0aec47108b6d90204663e457b1cb4487d41ec5d7e7a6"],
        ["0x000000000000000000000000000000000de437f1a84c19f842cf57e8050277ee","0x0000000000000000000000000000000085fb4e44aa54c94873414ecbf4487122","0x00000000000000000000000000000000ec2c7e8ebdd0cf3ecdbd2a47c25f6882","0x000000000000000000000000000000007d1c9c7f962023b3b2ce05fc22905b9b"]
      );

      subjectCaller = ramp;
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).processProof(subjectProof, subjectBodyHashProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof, subjectBodyHashProof);
    }

    it("should process the proof", async () => {
      const {
        amount,
        timestamp,
        offRamperIdHash,
        onRamperIdHash,
        intentHash
      } = await subjectCallStatic();

      const unpackedGarantiId = unpackPackedGarantiId(rawSignals.slice(12,17).map(x => BigNumber.from(x)));

      expect(amount).to.eq(usdc(800));
      expect(timestamp).to.eq(BigNumber.from(1703416861).add(30));  // 30s is default timestamp buffer);
      expect(offRamperIdHash).to.eq(calculateIbanHash(unpackedGarantiId));
      expect(onRamperIdHash).to.eq(rawSignals[19]);
      expect(intentHash).to.eq(rawSignals[21]);
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await nullifierRegistry.isNullified(subjectProof.signals[20].toHexString());

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
        await sendProcessor.setEmailFromAddress("bad-garanti@info.garantibbva.com.tr".padEnd(21, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await keyHashAdapter.removeMailServerKeyHash(rawSignals[0]);
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

      const venmoKeyHashAdapter = await sendProcessor.mailServerKeyHashAdapter();
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

      subjectEmailFromAddress = "new-garanti@info.garantibbva.com.tr".padEnd(21, "\0");
    });

    async function subject(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await sendProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("new-garanti@info.garantibbva.com.tr".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
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
