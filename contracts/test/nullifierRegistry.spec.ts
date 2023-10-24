import "module-alias/register";

import { ethers } from "hardhat";

import { Account } from "@utils/test/types";
import { NullifierRegistry } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { Address } from "@utils/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

const expect = getWaffleExpect();

describe("NullifierRegistry", () => {
  let owner: Account;
  let writer: Account;
  let attacker: Account;

  let nullifierRegistry: NullifierRegistry;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      writer,
      attacker,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    nullifierRegistry = await deployer.deployNullifierRegistry();
  });

  describe("#constructor", async () => {
    it("should have the correct owner set", async () => {
      const keyHash = await nullifierRegistry.owner();
      expect(keyHash).to.eq(owner.address);
    });
  });

  describe("#addNullifier", async () => {
    let subjectNullifier: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      await nullifierRegistry.addWritePermission(writer.address);

      subjectCaller = writer;

      subjectNullifier = ethers.utils.formatBytes32String("nullifier");
    });

    async function subject(): Promise<any> {
      return await nullifierRegistry.connect(subjectCaller.wallet).addNullifier(subjectNullifier);
    }

    it("should correctly add the nullifier", async () => {
      await subject();

      const isNullified = await nullifierRegistry.isNullified(subjectNullifier);
      expect(isNullified).to.be.true;
    });

    it("should emit the correct NullifierAdded event", async () => {
      await expect(subject()).to.emit(nullifierRegistry, "NullifierAdded").withArgs(
        subjectNullifier,
        subjectCaller.address
      );
    });

    describe("when the nullifier has already been added", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Nullifier already exists");
      });
    });

    describe("when the caller is not an allowed writer", async () => {
      beforeEach(async () => {
        subjectCaller = attacker;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Only addresses with write permissions can call");
      });
    });
  });

  describe("#addWritePermission", async () => {
    let subjectNewWriter: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectNewWriter = writer.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await nullifierRegistry.connect(subjectCaller.wallet).addWritePermission(subjectNewWriter);
    }

    it("should correctly add the new writer", async () => {
      const preIsWriter = await nullifierRegistry.isWriter(subjectNewWriter);
      const preWriters = await nullifierRegistry.getWriters();

      expect(preIsWriter).to.be.false;
      expect(preWriters).to.not.contain(subjectNewWriter);

      await subject();

      const isWriter = await nullifierRegistry.isWriter(subjectNewWriter);
      const writers = await nullifierRegistry.getWriters();

      expect(isWriter).to.be.true;
      expect(writers).to.contain(subjectNewWriter);
    });

    it("should emit the correct WriterAdded event", async () => {
      await expect(subject()).to.emit(nullifierRegistry, "WriterAdded").withArgs(
        subjectNewWriter
      );
    });

    describe("when the writer has already been added", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Address is already a writer");
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

  describe("#removeWritePermission", async () => {
    let subjectRemovedWriter: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      await nullifierRegistry.addWritePermission(writer.address);

      subjectRemovedWriter = writer.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await nullifierRegistry.connect(subjectCaller.wallet).removeWritePermission(subjectRemovedWriter);
    }

    it("should correctly remove the new writer", async () => {
      const preIsWriter = await nullifierRegistry.isWriter(subjectRemovedWriter);
      const preWriters = await nullifierRegistry.getWriters();

      expect(preIsWriter).to.be.true;
      expect(preWriters).to.contain(subjectRemovedWriter);

      await subject();

      const isWriter = await nullifierRegistry.isWriter(subjectRemovedWriter);
      const writers = await nullifierRegistry.getWriters();

      expect(isWriter).to.be.false;
      expect(writers).to.not.contain(subjectRemovedWriter);
    });

    it("should emit the correct WriterRemoved event", async () => {
      await expect(subject()).to.emit(nullifierRegistry, "WriterRemoved").withArgs(
        subjectRemovedWriter
      );
    });

    describe("when the writer has already been removed", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Address is not a writer");
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
