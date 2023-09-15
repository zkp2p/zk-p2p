import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { VenmoSendProcessor } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { GrothProof } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x00000000000000000000000000000000000000000000000000000030302e3033","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000","0x16b0c8e8bd4352f8b062923976cc0e51e26162dec17f12d353feac4d5f7ca27d","0x1e1d37257be43685d944597f63d00a6b638b9b4ff1752cf8db9c5de48ececbe8","0x0000000000000000000000000000000000000000000000000000000000000001"];

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
      return await deployer.deployVenmoSendProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await sendProcessor.venmoMailserverKeyHash();
      expect(venmoKeys).to.deep.equal(rawSignals[0]);
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
    let subjectProof: GrothProof;

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x0eaa19c3bf74c3f121b91b71ffa29e4fbea1a340760fc44ae9f1e9d055183e60"), BigNumber.from("0x2abb0d3b5f78a32d6aca1597fcb9729edc3a3a97da3b7cd589daa1e2ad81e5fd")]
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x29f45a9e4a9b3164a05ca0464daf917cd4bf15f94fe6d7dabf69b744e0330003"), BigNumber.from("0x2efbd77ae9447485a6c9419aa1f3a9d78342020b5d6635f4487f407f5673ca88")],
        [BigNumber.from("0x19d35344d9c6dd57b07bc4f341a7367378fd4437d70de454af137c79091ea55c"), BigNumber.from("0x0ca01729ed20a49c2e4b08e85d8a56ab7f03699fcc040e1bd8e232a0eb96bd4c")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x1811ec3c2fd0394afb654498bd7e666714335029827dfa7f811ee18b9a6be8f3"), BigNumber.from("0x2694c29e35126dd20d27d05c8e8394af42f96e8033b4b0e6face2e82ac1e3741")];
      const signals: BigNumber[] = rawSignals.map((signal) => BigNumber.from(signal));

      subjectProof = {
        a,
        b,
        c,
        signals
      };
    });

    async function subject(): Promise<any> {
      return await sendProcessor.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const {
        amount,
        offRamperIdHash,
        intentHash
      } = await subject();

      // expect(amount).to.eq(usdc(30));
      // expect(offRamperIdHash).to.eq("0x16b0c8e8bd4352f8b062923976cc0e51e26162dec17f12d353feac4d5f7ca27d");
      // expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000000001");
    });

    it("should add the email to the nullifier mapping", async () => {
      await subject();

      const isNullified = await sendProcessor.isEmailNullified(subjectProof.signals[12].toHexString());

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
        await sendProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(35, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await sendProcessor.setVenmoMailserverKeyHash(ZERO_BYTES32);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid mailserver key hash");
      });
    });
  });
});
