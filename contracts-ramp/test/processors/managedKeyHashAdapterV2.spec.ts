import "module-alias/register";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapterV2 } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

const expect = getWaffleExpect();

const keyHash1 = "0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";
const keyHash2 = "0x1cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";

describe("ManagedKeyHashAdapterV2", () => {
  let owner: Account;
  let attacker: Account;

  let keyHashAdapter: ManagedKeyHashAdapterV2;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
        owner,
        attacker,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    keyHashAdapter = await deployer.deployManagedKeyHashAdapterV2([keyHash1, keyHash2]);
  });

  describe("#constructor", async () => {
    it("should have the correct key hash", async () => {
        const keyHashes = await keyHashAdapter.getMailServerKeyHashes();

        const isKeyHashOne = await keyHashAdapter.isMailServerKeyHash(keyHash1);
        const isKeyHashTwo = await keyHashAdapter.isMailServerKeyHash(keyHash2);

        expect(isKeyHashOne).to.be.true;
        expect(isKeyHashTwo).to.be.true;
        expect(keyHashes).to.contain(keyHash1);
        expect(keyHashes).to.contain(keyHash2);
    });

    it("should have the correct owner set", async () => {
        const _owner = await keyHashAdapter.owner();
        expect(_owner).to.eq(owner.address);
    });

    describe("when duplicate keyHashes are passed", async () => {
      async function subject(): Promise<any> {
        keyHashAdapter = await deployer.deployManagedKeyHashAdapterV2([keyHash1, keyHash1]);
      };

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Key hash already added");
      });
    });
  });

  describe("#addMailServerKeyHash", async () => {
    let subjectMailServerKeyHash: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;

      subjectMailServerKeyHash = "0x06b0ad846d386f60e777f1d11b82922c6bb694216eed9c23535796ac404a7dfa";
    });

    async function subject(): Promise<any> {
      return await keyHashAdapter.connect(subjectCaller.wallet).addMailServerKeyHash(subjectMailServerKeyHash);
    }

    it("should set the correct venmo keys", async () => {
      await subject();

      const isKeyHash = await keyHashAdapter.isMailServerKeyHash(subjectMailServerKeyHash);
      const keyHashes = await keyHashAdapter.getMailServerKeyHashes();

      expect(isKeyHash).to.be.true;
      expect(keyHashes).to.contain(subjectMailServerKeyHash);
    });

    it("should emit the correct MailServerKeyHashAdded event", async () => {
      await expect(subject()).to.emit(keyHashAdapter, "MailServerKeyHashAdded").withArgs(
          subjectMailServerKeyHash
      );
    });

    describe("when the key hash has already been added", async () => {
      beforeEach(async () => {
          await subject();
      });

      it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Key hash already added");
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

  describe("#removeMailServerKeyHash", async () => {
    let subjectMailServerKeyHash: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectMailServerKeyHash = "0x06b0ad846d386f60e777f1d11b82922c6bb694216eed9c23535796ac404a7dfa";

      await keyHashAdapter.addMailServerKeyHash(subjectMailServerKeyHash);

      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await keyHashAdapter.connect(subjectCaller.wallet).removeMailServerKeyHash(subjectMailServerKeyHash);
    }

    it("should set the correct venmo keys", async () => {
      const preIsKeyHash = await keyHashAdapter.isMailServerKeyHash(subjectMailServerKeyHash);
      const preKeyHashes = await keyHashAdapter.getMailServerKeyHashes();
      expect(preIsKeyHash).to.be.true;
      expect(preKeyHashes).to.contain(subjectMailServerKeyHash);

      await subject();

      const isKeyHash = await keyHashAdapter.isMailServerKeyHash(subjectMailServerKeyHash);
      const keyHashes = await keyHashAdapter.getMailServerKeyHashes();

      expect(isKeyHash).to.be.false;
      expect(keyHashes).to.not.contain(subjectMailServerKeyHash);
    });

    it("should emit the correct MailServerKeyHashRemoved event", async () => {
      await expect(subject()).to.emit(keyHashAdapter, "MailServerKeyHashRemoved").withArgs(
        subjectMailServerKeyHash
      );
    });

    describe("when the key hash has already been removed", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Key hash not added");
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
