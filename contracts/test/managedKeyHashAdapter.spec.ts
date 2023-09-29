import "module-alias/register";

import { ethers } from "hardhat";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapter } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { Address } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

const expect = getWaffleExpect();

const venmoKeyHash = "0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";

describe("VenmoReceiveProcessor", () => {
  let owner: Account;
  let attacker: Account;

  let keyHashAdapter: ManagedKeyHashAdapter;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      attacker,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    keyHashAdapter = await deployer.deployManagedKeyHashAdapter(venmoKeyHash);
  });

  describe("#constructor", async () => {
    it("should have the correct key hash", async () => {
      const keyHash = await keyHashAdapter.venmoMailserverKeyHash();
      expect(keyHash).to.eq(venmoKeyHash);
    });
  });

  describe("#setVenmoMailserverKeyHash", async () => {
    let subjectVenmoMailserverKeyHash: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectVenmoMailserverKeyHash = "0x2db6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";
    });

    async function subject(): Promise<any> {
      return await keyHashAdapter.connect(subjectCaller.wallet).setVenmoMailserverKeyHash(subjectVenmoMailserverKeyHash);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const venmoKeyHash = await keyHashAdapter.venmoMailserverKeyHash();
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
});
