import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { VenmoReceiveProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

const expect = getWaffleExpect();

const rawSignals = ["0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000039313136383631","0x0000000000000000000000000000000000000000000000000000000000313535","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000034363137353436","0x0000000000000000000000000000000000000000000000000031343032303337","0x0000000000000000000000000000000000000000000000000000000036383136","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x1206de2703dac2f42de80b586fffe70b07f0e06a04914a97350c69887be43ca3","0x000000000000000000000000000000000083a043f3f512cb0e9efb506011e359","0x0000000000000000000000000000000000c2e52cefcd800a155366e0207f2563","0x0000000000000000000000000000000000f3576e6387ca2c770760edd72b0fae","0x00000000000000000000000000000000019143a1fc85a71614784b98ff4b16c0","0x00000000000000000000000000000000007bbd0dfb9ef73cf08f4036e24a6b72","0x000000000000000000000000000000000119d3bd704f04dc4f74482cdc239dc7","0x0000000000000000000000000000000001d083a581190a93434412d791fa7fd1","0x000000000000000000000000000000000064350c632569b077ed7b300d3a4051","0x00000000000000000000000000000000000000000000000000a879c82b6c5e0a","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x00000000000000000000000000000000018ca7c618d84c95643c3cf3d87e2043","0x00000000000000000000000000000000016dc4cb952d180706655d1653866721","0x0000000000000000000000000000000000fb4c2553ce6e918fd924ebe56fe8e0","0x00000000000000000000000000000000009f885c0854d67b1dc273ca47313e7d","0x00000000000000000000000000000000018fabb66322ca8b097f309605041eba","0x0000000000000000000000000000000000b45078441795760f2910e95476def1","0x0000000000000000000000000000000001ed9284aef2556cecbc983581c67629","0x00000000000000000000000000000000019c3379d51930f32e1903458244af93","0x00000000000000000000000000000000000000000000000000a3fe95dd833e03","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000001"];

describe("VenmoReceiveProcessor", () => {
  let owner: Account;

  let receiveProcessor: VenmoReceiveProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    receiveProcessor = await deployer.deployVenmoReceiveProcessor(
      rawSignals.slice(16,33).map((signal) => BigNumber.from(signal)),
      "venmo@venmo.com".padEnd(35, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectVenmoKeys: BigNumber[];
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectVenmoKeys = rawSignals.slice(16,33).map((signal) => BigNumber.from(signal));
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(35, "\0"); // Pad the address to match length returned by circuit
    });

    async function subject(): Promise<any> {
      return await deployer.deployVenmoReceiveProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await receiveProcessor.getVenmoMailserverKeys();
      expect(venmoKeys).to.deep.equal(rawSignals.slice(16,33).map((signal) => BigNumber.from(signal)));
    });

    it("should set the correct email from address", async () => {
      await subject();

      const emailFromAddress = await receiveProcessor.getEmailFromAddress();

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
      subjectA = [BigNumber.from("0x0229f835074668c381e7c5d60ee90958924f40c2b2987409c4e0eaf99278802b"), BigNumber.from("0x159ec2bd5b6de571cf9bc2574ea33b3c4be1b570ccc857c82f429bac968ebe0e")];
      subjectB = [
        [BigNumber.from("0x24cd78d7539ea99cb80cbcee17aace806a7c8db0eaea412385540f8909dee2c4"), BigNumber.from("0x1e61dd72baebf33c37f4dc59150af490182bf735539d0a5349b19f16f70ba823")],
        [BigNumber.from("0x2724172d8e693dc6a846ad0883e7d9efd9e1a1cc1b2f92c428e140889f2f89cb"), BigNumber.from("0x234eb2947255c7470ea137c2dba06ffe3872bf21d7ac0bf8aa0da30228ef0ae9")]
      ];
      subjectC = [BigNumber.from("0x262f28fc2eb38be605c874ae2709dede403a471cfb19d7adc56137da7a12ef6c"), BigNumber.from("0x07040c0f6187d829b5b3623e713f5f299c46acc1b6051c87af7b59c5af999c81")];
      subjectSignals = rawSignals.map((signal) => BigNumber.from(signal));
    });

    async function subject(): Promise<any> {
      return await receiveProcessor.processProof(subjectA, subjectB, subjectC, subjectSignals);
    }

    it("should process the proof", async () => {
      const {
        timestamp,
        onRamperId,
        onRamperIdHash,
        intentHash
      } = await subject();

      expect(timestamp).to.eq(BigNumber.from(1686119551));
      expect(onRamperIdHash).to.eq("0x1206de2703dac2f42de80b586fffe70b07f0e06a04914a97350c69887be43ca3");
      expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000000001");
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
        await receiveProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(35, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await receiveProcessor.setVenmoMailserverKeys(
          rawSignals.slice(16,33).map((signal) => BigNumber.from(signal).add(1))
        );
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid: RSA modulus not matched");
      });
    });
  });
});
