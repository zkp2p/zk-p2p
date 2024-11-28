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

const rawSignals = ["0x03a9c8babd6b4ad94d711f3ffbee84b7aa69f4cb0dd08d491c5a5c32eca15f60","0x0000000000000000000000000000000074d5bfa8b7948faf4db367e093139ab0","0x00000000000000000000000000000000cb1dd3b7fcf3534af5506dddda4bc17e","0x00000000000000000000000000000000e164fb82a38d8a8437e9641c804eb311","0x0000000000000000000000000000000081a6b7791c2c54f97d2ca0b69adfc33b","0x0000000000000000000000000000000000000000000000000069746e61726167","0x00000000000000000000000000000000000000000000000000672e6f666e6940","0x000000000000000000000000000000000000000000000000006269746e617261","0x000000000000000000000000000000000000000000000000006d6f632e617662","0x000000000000000000000000000000000000000000000000000000000072742e","0x0000000000000000000000000000000000000000000000000033353139303731","0x0000000000000000000000000000000000000000000000000000000000333832","0x000000000000000000000000000000000000000000000000004d206e61697242","0x00000000000000000000000000000000000000000000000000206c6561686369","0x00000000000000000000000000000000000000000000000000616d6b63696557","0x0000000000000000000000000000000000000000000000000000000000006e6e","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000030302032395254","0x0000000000000000000000000000000000000000000000000030303033203031","0x0000000000000000000000000000000000000000000000000030203030303020","0x0000000000000000000000000000000000000000000000000036333620323630","0x0000000000000000000000000000000000000000000000000000000036302039","0x00000000000000000000000000000000000000000000000000000030302c3139","0x0000000000000000000000000000000000000000000000000000000000000000","0x071caee57e1bb6d2542fffa8b70fdd31f73ce937e8aa12735701d2481b7b0228","0x0c0bde4da674e6e42db3598df21fa56a4d7f825768ccf0786c7cea6342de8c1b","0x0000000000000000000000000000000000000000000000000000000000003039"];

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
        ["0x048f0191a0c97d837f6d665f6ca2178adef3b0addd4125d970dfeaf1825a470c", "0x14860fbaf039aa48a059b902f6eb4f562991cff602e07078dba373d76614cd3c"],
        [["0x1175295c644d0e6eba8d75d5387f77d3ca8d6d38b914bcfcaaa2bb757dd32a60", "0x12d0731577461c3a0766731d3ab9a8b17768f1b99e17e9fc7f6d5a6dd6a74667"],["0x12fc86ca6a28eba14f80b444a18eb297d8dc758d065f2ec5d91f637e8ec0ab49", "0x0234e89a9c9af4f7a352cba293dad73c4700835bba59e3141ec3f54343636f27"]],
        ["0x29e62440bbdf906c21a96f6f84873d00e26ca0a67dd2861c601bc94202cc418b", "0x23000b0f83f884c580932b45d383eb432f16f583962a70c1921be40e5a4c46a3"],
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
      return await sendProcessor.connect(subjectCaller.wallet).processProof(subjectProof, subjectBodyHashProof);
    }

    async function subjectCallStatic(): Promise<any> {
      return await sendProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof, subjectBodyHashProof);
    }

    it("should process the proof", async () => {
      const {
        amount,
        timestamp,
        offRamperNameHash,
        offRamperIdHash,
        onRamperIdHash,
        intentHash
      } = await subjectCallStatic();

      const unpackedGarantiId = unpackPackedGarantiId(rawSignals.slice(18,23).map(x => BigNumber.from(x)));

      expect(amount).to.eq(usdc(91));
      expect(timestamp).to.eq(BigNumber.from(1709153283).add(30));  // 30s is default timestamp buffer;
      // Hardcoding value to protect privacy, confirmed that hashed value matches the extracted value from the email
      expect(offRamperNameHash).to.eq("0x0155fe18a13bde7830d4f1253e8a58c038360e2116663a65ee44ef29e4f8f4ae");
      expect(offRamperIdHash).to.eq(calculateIbanHash(unpackedGarantiId));
      expect(onRamperIdHash).to.eq(rawSignals[25]);
      expect(intentHash).to.eq(rawSignals[27]);
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await nullifierRegistry.isNullified(subjectProof.signals[26].toHexString());

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

    describe("when the body hash proof is invalid", async () => {
      beforeEach(async () => {
        subjectBodyHashProof.signals[0] = BigNumber.from("0x0000000000000000000000000000000000000000000000000076406f6d6e6476");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid body hash proof");
      });
    });

    describe("when the intermediate hash inputs or body hash outputs do not match send proof", async () => {
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
