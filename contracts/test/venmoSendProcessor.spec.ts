import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { VenmoSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";

const expect = getWaffleExpect();

const rawSignals = ["0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x00000000000000000000000000000000000000000000000000000030302e3033","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000037303232383532","0x0000000000000000000000000000000000000000000000000038353231343535","0x00000000000000000000000000000000000000000000000000363934320a0d3d","0x0000000000000000000000000000000000000000000000000000000000000037","0x0000000000000000000000000000000000000000000000000000000000000000","0x16b0c8e8bd4352f8b062923976cc0e51e26162dec17f12d353feac4d5f7ca27d","0x000000000000000000000000000000000083a043f3f512cb0e9efb506011e359","0x0000000000000000000000000000000000c2e52cefcd800a155366e0207f2563","0x0000000000000000000000000000000000f3576e6387ca2c770760edd72b0fae","0x00000000000000000000000000000000019143a1fc85a71614784b98ff4b16c0","0x00000000000000000000000000000000007bbd0dfb9ef73cf08f4036e24a6b72","0x000000000000000000000000000000000119d3bd704f04dc4f74482cdc239dc7","0x0000000000000000000000000000000001d083a581190a93434412d791fa7fd1","0x000000000000000000000000000000000064350c632569b077ed7b300d3a4051","0x00000000000000000000000000000000000000000000000000a879c82b6c5e0a","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000fd47acc5940b049f287908443de2dc","0x0000000000000000000000000000000000297f92dfc158fd94c1aa46647fcd76","0x0000000000000000000000000000000001e0bc20796c16949b8c15b73c383fab","0x000000000000000000000000000000000019fb0466dab5a4ac10ec6b2349d83f","0x00000000000000000000000000000000007bdba1dc4ac6fce5cbb24ab8bec301","0x0000000000000000000000000000000000aa62b91787a347bc61cd6c1765d0dc","0x0000000000000000000000000000000000a360ad58e6f5b37ea7ce94218a821d","0x000000000000000000000000000000000151a1c1cca84c03addea28fbc7d9095","0x00000000000000000000000000000000000000000000000000512efa60001505","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000001"];

describe("VenmoSendProcessor", () => {
  let owner: Account;

  let sendProcessor: VenmoSendProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    sendProcessor = await deployer.deployVenmoSendProcessor(
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
      return await deployer.deployVenmoSendProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await sendProcessor.getVenmoMailserverKeys();
      expect(venmoKeys).to.deep.equal(rawSignals.slice(16,33).map((signal) => BigNumber.from(signal)));
    });

    it("should set the correct email from address", async () => {
      await subject();

      const emailFromAddress = await sendProcessor.getEmailFromAddress();

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
      subjectA = [BigNumber.from("0x0b0b4e84e5c51ae2a9721cb602e228363182194706ffed770bee73874629b063"), BigNumber.from("0x21428a324affa2b7f8efc5d28446134f0328a0623023b88bbedbe2bdcfd26342")]
      subjectB = [
        [BigNumber.from("0x2fe0c6e283e8f8d099c826558b402978040e34b0b9538657490e333c19bc7c82"), BigNumber.from("0x1300aca15d061809390b7002ddce8f0f9c257689e1b099590e3d3d170722b3b6")],
        [BigNumber.from("0x1f98f85a50697aee77142f2cd42c2a158f5700ee845d79a8bad89403442c366b"), BigNumber.from("0x104eadfc1e1e79e27f14300132aa344ec6dc094c19ae7b35e49e43cb75c99cc8")]
      ];
      subjectC = [BigNumber.from("0x2b55f3547476d048fe939b45cac12617d3a8a1745277f1cc7b78927a10b97b52"), BigNumber.from("0x1caf8f0ce598bd5bf83a722c93f7d8fbb779d798a20db59dc8d283ddda98d714")];
      subjectSignals = rawSignals.map((signal) => BigNumber.from(signal));
    });

    async function subject(): Promise<any> {
      return await sendProcessor.processProof(subjectA, subjectB, subjectC, subjectSignals);
    }

    it("should process the proof", async () => {
      const {
        amount,
        offRamperId,
        offRamperIdHash,
        intentHash
      } = await subject();

      expect(amount).to.eq(usdc(30));
      expect(offRamperIdHash).to.eq("0x16b0c8e8bd4352f8b062923976cc0e51e26162dec17f12d353feac4d5f7ca27d");
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
        await sendProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(35, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await sendProcessor.setVenmoMailserverKeys(
          rawSignals.slice(16,33).map((signal) => BigNumber.from(signal).add(1))
        );
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid: RSA modulus not matched");
      });
    });
  });
});
