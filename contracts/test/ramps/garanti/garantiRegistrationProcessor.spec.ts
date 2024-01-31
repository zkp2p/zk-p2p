import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapterV2, NullifierRegistry, GarantiRegistrationProcessor, GarantiBodyHashVerifier } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Address } from "@utils/types";
import { createTypedGarantiBodyHashProof, createTypedSendProof } from "@utils/protocolUtils"

const expect = getWaffleExpect();
const abiCoder = new ethers.utils.AbiCoder();

const rawSignals = ["0x03a9c8babd6b4ad94d711f3ffbee84b7aa69f4cb0dd08d491c5a5c32eca15f60","0x000000000000000000000000000000000de437f1a84c19f842cf57e8050277ee","0x0000000000000000000000000000000085fb4e44aa54c94873414ecbf4487122","0x00000000000000000000000000000000ec2c7e8ebdd0cf3ecdbd2a47c25f6882","0x000000000000000000000000000000007d1c9c7f962023b3b2ce05fc22905b9b","0x0000000000000000000000000000000000000000000000000069746e61726167","0x00000000000000000000000000000000000000000000000000672e6f666e6940","0x000000000000000000000000000000000000000000000000006269746e617261","0x000000000000000000000000000000000000000000000000006d6f632e617662","0x000000000000000000000000000000000000000000000000000000000072742e","0x071caee57e1bb6d2542fffa8b70fdd31f73ce937e8aa12735701d2481b7b0228"];

describe("GarantiRegistrationProcessor", () => {
  let owner: Account;
  let attacker: Account;
  let ramp: Account;

  let keyHashAdapter: ManagedKeyHashAdapterV2;
  let nullifierRegistry: NullifierRegistry;
  let bodyHashVerifier: GarantiBodyHashVerifier;
  let registrationProcessor: GarantiRegistrationProcessor;

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
    registrationProcessor = await deployer.deployGarantiRegistrationProcessor(
      ramp.address,
      keyHashAdapter.address,
      nullifierRegistry.address,
      bodyHashVerifier.address,
      "garanti@info.garantibbva.com.tr"
    );

    await nullifierRegistry.connect(owner.wallet).addWritePermission(registrationProcessor.address);
  });

  describe("#constructor", async () => {
    it("should set the correct state", async () => {
      const rampAddress = await registrationProcessor.ramp();
      const venmoMailserverKeyHashAdapter = await registrationProcessor.mailServerKeyHashAdapter();
      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

      expect(rampAddress).to.eq(ramp.address);
      expect(venmoMailserverKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
      expect(ethers.utils.toUtf8Bytes("garanti@info.garantibbva.com.tr")).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });
  });

  describe("#processProof", async () => {
    let subjectProof: any;
    let subjectBodyHashProof: any;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = createTypedSendProof(
        ["0x0389d132b5d2e1d9df89b8ebd21e6116b4f2640b4a191d79292bd3c4fcf8b16a", "0x19987648fefb4e66335c9f045713a0434fc4ba8e6b380767207129d744b8ffc2"],
        [["0x0a2ee9c1de104203628d6dc3224f7630ee3df8b22d4d5b99659cdfa6b3507fd1", "0x2af41646939b18c265f46b101aa964df395273c5269d63e288eb70893bde60d2"],["0x0aa16b290262094f120a76fc6d53490e373ccc1325b0c9d98573d19f78b54eab", "0x2499ae14df27902e06077a9dd3a2bb8f0c492bb2d67e2f0f6f21e611cf3517b0"]],
        ["0x010001222e45ad8f4dadcdb67608a4bc6462aac6436a6b52372f3fa445436429", "0x1b067ff66aac409e7c976ad48738686f2fd0fd817abe02999cc5594282469c5f"],
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
      return await registrationProcessor.connect(subjectCaller.wallet).processProof(subjectProof, subjectBodyHashProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof, subjectBodyHashProof);
    }

    it("should process the proof", async () => {
      const onRamperIdHash = await subjectCallStatic();

      expect(onRamperIdHash).to.eq(subjectProof.signals[10]);
    });

    it("should add the hash of the proof inputs to the nullifier registry", async () => {
      await subject();

      const expectedNullifier = ethers.utils.keccak256(
        abiCoder.encode(
          ["tuple(uint256[2],uint256[2][2],uint256[2],uint256[11])"],
          [[subjectProof.a, subjectProof.b, subjectProof.c, subjectProof.signals]]
        )
      );
      const isNullified = await nullifierRegistry.isNullified(expectedNullifier);

      expect(isNullified).to.be.true;
    });

    describe("when the email has been used previously", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Nullifier has already been used");
      });
    });

    describe("when the proof is invalid", async () => {
      beforeEach(async () => {
        subjectProof.signals[0] = BigNumber.from("0x0000000000000000000000000000000000000000000000000076406f6d6e6476");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid Proof");
      });
    });

    describe("when the body hash proof is invalid", async () => {
      beforeEach(async () => {
        subjectBodyHashProof.signals[0] = BigNumber.from("0x0000000000000000000000000000000000000000000000000076406f6d6e6476");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid body hash proof");
      });
    });

    describe("when the intermediate hash inputs or body hash outputs do not match registration proof", async () => {
      beforeEach(async () => {
        subjectBodyHashProof = createTypedGarantiBodyHashProof(
          ["0x0e66547750bf9cb8b1bac8aaff2a03abef9cf45c41dd854f23298122070e975c", "0x2a2b72d169e4e4d68a8b88992722e28e35ba9e4472c03f09c92e36dde7e3e22d"],
          [["0x1b97359e1fb6f0fae93b63206f27dcb6d6ffc0b877112243463de0b6d39c34ec", "0x23e07c78b5bc6a5f7527b70d1af6598f1c194b8bdb2e20c7968921704666832f"],["0x29cfa6511c7abc33d469ecf639ba9c636d25f04f7b9a525606c5c5f86f1436a6", "0x003abf5ae8e461dbb08146232029102155e586a300bbc764a1b2f77cd57fddc0"]],
          ["0x2a9929438e9855e63499be2def743cebcc02cebdf5e5e7332a63a75c7ff9b14d", "0x1103162cc9be5c964dd4f9f0e4fbcd7c4168d6d7eadabdca80062b1d511b395d"],
          ["0x00000000000000000000000000000000956aea87342330c30659a03d50e9d366","0x000000000000000000000000000000002893a7e72bb6e18dad7d41195d3d0b1b","0x00000000000000000000000000000000a884191ca5f59e979b8b748037b64f28","0x000000000000000000000000000000009d8a7867dc7f86cc32ca8dad25bad3ef"]
        );
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid intermediate or output hash");
      });
    });

    describe("when the email is from an invalid venmo address", async () => {
      beforeEach(async () => {
        await registrationProcessor.setEmailFromAddress("bad-garanti@info.garantibbva.com.tr".padEnd(21, "\0"));
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

      const venmoKeyHashAdapter = await registrationProcessor.mailServerKeyHashAdapter();
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
      return await registrationProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

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
