import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { VenmoRegistrationProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

const expect = getWaffleExpect();

const rawSignals = ["0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000039363838363131","0x0000000000000000000000000000000000000000000000000035383937313136","0x0000000000000000000000000000000000000000000000000000003636393832","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0817ca52491dc3b8ab4a307f50a79f3ff57913c1b97715503ee877ca3e5c73f2","0x000000000000000000000000000000000083a043f3f512cb0e9efb506011e359","0x0000000000000000000000000000000000c2e52cefcd800a155366e0207f2563","0x0000000000000000000000000000000000f3576e6387ca2c770760edd72b0fae","0x00000000000000000000000000000000019143a1fc85a71614784b98ff4b16c0","0x00000000000000000000000000000000007bbd0dfb9ef73cf08f4036e24a6b72","0x000000000000000000000000000000000119d3bd704f04dc4f74482cdc239dc7","0x0000000000000000000000000000000001d083a581190a93434412d791fa7fd1","0x000000000000000000000000000000000064350c632569b077ed7b300d3a4051","0x00000000000000000000000000000000000000000000000000a879c82b6c5e0a","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x00000000000000000000000000000000018ca7c618d84c95643c3cf3d87e2043","0x00000000000000000000000000000000016dc4cb952d180706655d1653866721","0x0000000000000000000000000000000000fb4c2553ce6e918fd924ebe56fe8e0","0x00000000000000000000000000000000009f885c0854d67b1dc273ca47313e7d","0x00000000000000000000000000000000018fabb66322ca8b097f309605041eba","0x0000000000000000000000000000000000b45078441795760f2910e95476def1","0x0000000000000000000000000000000001ed9284aef2556cecbc983581c67629","0x00000000000000000000000000000000019c3379d51930f32e1903458244af93","0x00000000000000000000000000000000000000000000000000a3fe95dd833e03","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"];

describe("VenmoRegistrationProcessor", () => {
  let owner: Account;

  let registrationProcessor: VenmoRegistrationProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    registrationProcessor = await deployer.deployVenmoRegistrationProcessor(
      rawSignals.slice(11,28).map((signal) => BigNumber.from(signal)),
      "venmo@venmo.com".padEnd(35, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectVenmoKeys: BigNumber[];
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectVenmoKeys = rawSignals.slice(11,28).map((signal) => BigNumber.from(signal));
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(35, "\0"); // Pad the address to match length returned by circuit
    });

    async function subject(): Promise<any> {
      return await deployer.deployVenmoRegistrationProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await registrationProcessor.getVenmoMailserverKeys();
      expect(venmoKeys).to.deep.equal(rawSignals.slice(11,28).map((signal) => BigNumber.from(signal)));
    });

    it("should set the correct email from address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("venmo@venmo.com".padEnd(35, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });

    describe("when the email address is not properly padded", async () => {
      beforeEach(async () => {
        subjectEmailFromAddress = "venmo@venmo.com".padEnd(34, "\0");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Email from address not properly padded");
      });
    });
  });

  describe("#processProof", async () => {
    let subjectA: [BigNumber, BigNumber];
    let subjectB: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
    let subjectC: [BigNumber, BigNumber];
    let subjectSignals: BigNumber[];

    beforeEach(async () => {
      subjectA = [BigNumber.from("0x2cff8a69249a6296247ec0b54c62db9e53e7708e6cf770dd552a196bf9911d5a"), BigNumber.from("0x0ccf1fe6ba4f18b843bf5ed3b5d29813eedfca2bfc4dd9bf4094144e5201f2d4")];
      subjectB = [
        [BigNumber.from("0x206c18d0ea140756e12395ab36706f488224aac98f9acf58f929ffd499aa4b34"), BigNumber.from("0x22ab61193d731a53f47fcaec0bd9d4b5f3b21af77c749a59754450f8543ba393")],
        [BigNumber.from("0x1ca5527010d293f079be50554e6dea9c327ac942497a5add65dbda1d568f41f9"), BigNumber.from("0x163fa370d71e14b1b58fe902bce5bacf4b3c28c69bc16700198eee897e7b00d2")]
      ];
      subjectC = [BigNumber.from("0x2fe4d1f6ef5f37516f4b4349b750c8d15ffe90b6efaa270aefa0c2ad3dd24a90"), BigNumber.from("0x25252599e588d9197d1bdf1650a31d81c4c2edb2ea4aa27092c6a2e0494d16c1")];
      subjectSignals = rawSignals.map((signal) => BigNumber.from(signal));
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.processProof(subjectA, subjectB, subjectC, subjectSignals);
    }

    it("should process the proof", async () => {
      const {
        onRamperId,
        onRamperIdHash,
      } = await subject();

      expect(onRamperIdHash).to.eq("0x0817ca52491dc3b8ab4a307f50a79f3ff57913c1b97715503ee877ca3e5c73f2");
    });

    describe("when the proof is invalid", async () => {
      beforeEach(async () => {
        subjectSignals[0] = BigNumber.from("0x0000000000000000000000000000000000000000000000000076406f6d6e6476");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid Proof");
      });
    });

    describe("when the email is from an invalid venmo address", async () => {
      beforeEach(async () => {
        await registrationProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(35, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await registrationProcessor.setVenmoMailserverKeys(
          rawSignals.slice(16,33).map((signal) => BigNumber.from(signal).add(1))
        );
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid: RSA modulus not matched");
      });
    });    
  });
});
