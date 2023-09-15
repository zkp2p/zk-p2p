import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { VenmoReceiveProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { GrothProof } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000039313136383631","0x0000000000000000000000000000000000000000000000000000000000313535","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x1206de2703dac2f42de80b586fffe70b07f0e06a04914a97350c69887be43ca3","0x2b3988d84418519ed7d30e7032a19e8755404f2d3ceae36b152b5e97c432966a","0x0000000000000000000000000000000000000000000000000000000000000001"];

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
      rawSignals[0],
      "venmo@venmo.com".padEnd(35, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectVenmoKeys: string;
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectVenmoKeys = rawSignals[0];
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(35, "\0"); // Pad the address to match length returned by circuit
    });

    async function subject(): Promise<any> {
      return await deployer.deployVenmoReceiveProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await receiveProcessor.venmoMailserverKeyHash();
      expect(venmoKeys).to.deep.equal(rawSignals[0]);
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
    let subjectProof: GrothProof;

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x18fb5ad309fae7cd139d96dcf8f065ea855c55fda7e7e8d6731cf7d2bdc2e545"), BigNumber.from("0x0c85e31be3a4976435edfe0a93294f78099fe391a32aa31ccadccd7579bd6673")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x250aeca4b76f4a442f53417ddd4f36cf99e870706bcd3093a455d4d14d171c16"), BigNumber.from("0x0b9de03d19956008e4708da3cae42ab0dd74ac3566e4fb25616a71503b3650e2")],
        [BigNumber.from("0x00ea0d908187ae6ad0b73b0dd94a95d0e422792db0053da663954c09e9898da4"), BigNumber.from("0x1308867fcb44367285aa469eea055f8dedc1faf99ae62bf336d9e36cd9e7ffb8")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x110a1018b1aed265382e3fd56382838c4724ca95696819e2dd27617e1bdde565"), BigNumber.from("0x0d17497c73fc01814b279dbb21d2c7a5db5ab35790138092f670b3cdaf074805")];
      const signals: BigNumber[] = rawSignals.map((signal) => BigNumber.from(signal));

      subjectProof = {
        a,
        b,
        c,
        signals
      };
    });

    async function subject(): Promise<any> {
      return await receiveProcessor.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const output = await subject();

      // expect(timestamp).to.eq(BigNumber.from(1686119551));
      // expect(onRamperIdHash).to.eq("0x1206de2703dac2f42de80b586fffe70b07f0e06a04914a97350c69887be43ca3");
      // expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000000001");
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await receiveProcessor.isEmailNullified(subjectProof.signals[12].toHexString());

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
        await receiveProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(35, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the mailserver key hash doesn't match", async () => {
      beforeEach(async () => {
        await receiveProcessor.setVenmoMailserverKeyHash(ZERO_BYTES32);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid mailserver key hash");
      });
    });
  });
});
