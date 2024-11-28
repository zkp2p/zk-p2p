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

const rawSignals = ["0x03a9c8babd6b4ad94d711f3ffbee84b7aa69f4cb0dd08d491c5a5c32eca15f60","0x0000000000000000000000000000000074d5bfa8b7948faf4db367e093139ab0","0x00000000000000000000000000000000cb1dd3b7fcf3534af5506dddda4bc17e","0x00000000000000000000000000000000e164fb82a38d8a8437e9641c804eb311","0x0000000000000000000000000000000081a6b7791c2c54f97d2ca0b69adfc33b","0x0000000000000000000000000000000000000000000000000069746e61726167","0x00000000000000000000000000000000000000000000000000672e6f666e6940","0x000000000000000000000000000000000000000000000000006269746e617261","0x000000000000000000000000000000000000000000000000006d6f632e617662","0x000000000000000000000000000000000000000000000000000000000072742e","0x071caee57e1bb6d2542fffa8b70fdd31f73ce937e8aa12735701d2481b7b0228"];

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
        ["0x10b0fd956de88289ef2cf645d8346c0b7b33f056c1ba0567648c9308e3c27ed4", "0x0c1cc5144929c9476409a359c78543b39aa6a3c008d2d5c6be1a5dc9b50a0aa9"],
        [["0x27c65e310658b393814b100735b73e32f46c1a8f1c56e6dd506cf1e9e37a1443", "0x07e50a9e225e6a46565f674d64cfac26ef75e9411a428af4df9a74fa6f42b307"],["0x00c799e545a1325f8f8240312cf8b50d06ed375668728f42804f15c05690f70c", "0x1af5163881df557ab8e2b30a757b5a0ec567d0ce7a4f911ce8cd1ccf264eba17"]],
        ["0x17e8f2d021aae515741453b1d9a6d5e8b2113a3dac2d46927c79d462bd5940cd", "0x1b150e4dda4f9015820185eccdc9e7e81d07575a9c90d79a5610deb630b26947"],
        rawSignals
      );

      subjectBodyHashProof = createTypedGarantiBodyHashProof(
        ["0x064f2dc03125ae60ce37fca0861252ad5eade0bcd8de61137cfc90f695dfc9a9", "0x1d19869fbddb3ffb43b1fa4adea5741c185472cbca906fc252dcdb4b708a103f"],
        [["0x25f15ae8c6c6ab9e074b3e64a96a1eb109dfd55ab0b6e724e6ca137697cdfbd5", "0x0b438fc0542c9149bbac9c5a9d19f8dfaa72f7938e02f73f2b45041dca220ffc"],["0x09fb9137a12f8f3ba7c5343e0bf7fb2168825e1115eb83337c8da0b3e15ca7de", "0x2f88a6a5fd7efa8b2740e8db6e52cd43de78cb41de211b859783887839ba9564"]],
        ["0x0df753236289f8aa2d441e20a4d68d619ebd23b26c590ef38ee19d091f639079", "0x06c7effc5a391d41ea8853233d1c31af144ec3571973acd5c0e8c1fa628ae6f1"],
        ["0x0000000000000000000000000000000074d5bfa8b7948faf4db367e093139ab0","0x00000000000000000000000000000000cb1dd3b7fcf3534af5506dddda4bc17e","0x00000000000000000000000000000000e164fb82a38d8a8437e9641c804eb311","0x0000000000000000000000000000000081a6b7791c2c54f97d2ca0b69adfc33b"]
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
          ["14653874762226132125813581944173037734680002926894352348432804459120790833709","4234420865087992990623206285467306548429197251036324906379237459344206070342"],
          [["4125845894707116080045121935750809218242993114300380408255127016706351425352","20248180750226637189124475786840065563207423742119523002941288249073406581495"],["19719680405882474141535640065057829220766720268885201592278653483797737282362","1237550097294003602289904713261161147452394470305459607873182705820463992626"]],
          ["4902076314490420019554958417627753236288208391516898332296731504413924237172","9411866177864923399792803176920660451367924614019213127846448747609230749753"],
          ["184252605284363595149139887860778008382","33631160057821328359498276332141373559","81428775102482486021288598358053856364","81392513454050495164061550799124406523"]
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
