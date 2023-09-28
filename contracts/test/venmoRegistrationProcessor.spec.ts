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
import { ZERO_BYTES32 } from "@utils/constants";
import { GrothProof } from "@utils/types";

const expect = getWaffleExpect();

const rawSignals = ["0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f","0x0000000000000000000000000000000000000000000000000076406f6d6e6576","0x000000000000000000000000000000000000000000000000006f632e6f6d6e65","0x000000000000000000000000000000000000000000000000000000000000006d","0x11f8b26b3d9857141566c7a7f2bb8cae1f7bc353c242be0aa87937cb89de5914"];

describe("VenmoRegistrationProcessor", () => {
  let owner: Account;
  let attacker: Account;

  let registrationProcessor: VenmoRegistrationProcessor;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    registrationProcessor = await deployer.deployVenmoRegistrationProcessor(
      rawSignals[0],
      "venmo@venmo.com".padEnd(21, "\0")
    );
  });

  describe("#constructor", async () => {
    let subjectVenmoKeys: string;
    let subjectEmailFromAddress: string;

    beforeEach(async () => {
      subjectVenmoKeys = rawSignals[0];
      subjectEmailFromAddress = "venmo@venmo.com".padEnd(21, "\0"); // Pad the address to match length returned by circuit
    });

    async function subject(): Promise<any> {
      return await deployer.deployVenmoRegistrationProcessor(subjectVenmoKeys, subjectEmailFromAddress);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeys = await registrationProcessor.venmoMailserverKeyHash();
      expect(venmoKeys).to.deep.equal(rawSignals[0]);
    });

    it("should set the correct email from address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("venmo@venmo.com".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
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
    let subjectProof: any;

    beforeEach(async () => {
      const a: [BigNumber, BigNumber] = [BigNumber.from("0x217bb9de7a38bebfcbbbe3d2f84266c15b64f1c95ebeec19275f4dc6a89a0785"), BigNumber.from("0x29dda564672b889fa8a5680145621f9c4af96984d45463663ed791c2df1080c9")];
      const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [
        [BigNumber.from("0x06a1bac01f3ebedb2c39e11177e96599e4195fff327332f16066c67b0069efb6"), BigNumber.from("0x26cc43627beffec13a1cbed928aeb6fa89f50f0b6b55ab2def1f51ba9a6fa16d")],
        [BigNumber.from("0x1673ac5dbfa34d81d423e3370758a463ca1fd82a73343f97c202ef4fddcd3a24"), BigNumber.from("0x046e687de5da15bdcdd811696ad7b3a325aef6aa75bc4a24da669049b76fd9f6")]
      ];
      const c: [BigNumber, BigNumber] = [BigNumber.from("0x02e0b990f7916d89e3fa082f8ccfadc8d59f0ea81e711e11eec5123036daafc6"), BigNumber.from("0x25afb839ba1f670c536ebf70ca7636435f4ac9f853add3d1364e50802d2e8820")];
      const signals: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] = [BigNumber.from(rawSignals[0]), BigNumber.from(rawSignals[1]), BigNumber.from(rawSignals[2]), BigNumber.from(rawSignals[3]), BigNumber.from(rawSignals[4])];

      subjectProof = {
        a,
        b,
        c,
        signals
      };
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.processProof(subjectProof);
    }

    it("should process the proof", async () => {
      const onRamperIdHash = await subject();

      expect(onRamperIdHash).to.eq(subjectProof.signals[4]);
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
        await registrationProcessor.setEmailFromAddress("bad-venmo@venmo.com".padEnd(21, "\0"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid email from address");
      });
    });

    describe("when the rsa modulus doesn't match", async () => {
      beforeEach(async () => {
        await registrationProcessor.setVenmoMailserverKeyHash(ZERO_BYTES32);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid mailserver key hash");
      });
    });    
  });

  describe("#setVenmoMailserverKeyHash", async () => {
    let subjectVenmoMailserverKeyHash: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVenmoMailserverKeyHash = BigNumber.from(rawSignals[0]).add(1).toHexString();
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setVenmoMailserverKeyHash(subjectVenmoMailserverKeyHash);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHash = await registrationProcessor.venmoMailserverKeyHash();
      expect(venmoKeyHash).to.equal(subjectVenmoMailserverKeyHash);
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

      subjectEmailFromAddress = "new-venmo@venmo.com".padEnd(21, "\0");
    });

    async function subject(): Promise<any> {
      return await registrationProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
    }

    it("should set the correct venmo address", async () => {
      await subject();

      const emailFromAddress = await registrationProcessor.getEmailFromAddress();

      expect(ethers.utils.toUtf8Bytes("new-venmo@venmo.com".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
    });

    describe("when the email address is not properly padded", async () => {
      beforeEach(async () => {
        subjectEmailFromAddress = "venmo@venmo.com".padEnd(34, "\0");
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Email from address not properly padded");
      });
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
