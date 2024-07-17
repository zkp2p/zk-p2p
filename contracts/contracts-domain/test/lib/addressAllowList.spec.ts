import "module-alias/register";

import {

} from "@utils/types";
import { Account } from "@utils/test/types";
import { Address, Proof } from "@utils/types";
import {
  AddressAllowListMock,
} from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

const expect = getWaffleExpect();

describe("AddressAllowList", () => {
  let owner: Account;
  let allowedOne: Account;
  let allowedTwo: Account;

  let allowList: AddressAllowListMock;
  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      allowedOne,
      allowedTwo
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    allowList = await deployer.deployAddressAllowListMock([allowedOne.address]);
  });

  describe("#constructor", async () => {
    let subjectAllowedAddresses: Address[];

    beforeEach(async () => {
      subjectAllowedAddresses = [allowedOne.address];
    });

    async function subject(): Promise<any> {
      return await deployer.deployAddressAllowListMock(subjectAllowedAddresses);
    };

    it("should set the correct contract state", async () => {
      const allowList = await subject();

      const actualOwner = await allowList.owner();
      const actualAllowed = await allowList.getAllowedAddresses();
      const actualIsAllowed = await allowList.isAllowed(allowedOne.address);
      const actualIsEnabled = await allowList.isEnabled();

      expect(actualOwner).to.equal(owner.address);
      expect(JSON.stringify(actualAllowed)).to.equal(JSON.stringify([allowedOne.address]));
      expect(actualIsAllowed).to.be.true;
      expect(actualIsEnabled).to.be.true;
    });

    describe("when there are duplicate addresses in the array", async () => {
      beforeEach(async () => {
        subjectAllowedAddresses = [allowedOne.address, allowedOne.address];
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Address is already allowed");
      });
    });
  });

  describe("#testOnlyAllowed", async () => {
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = allowedOne;
    });

    async function subject(): Promise<any> {
      return await allowList.connect(subjectCaller.wallet).testOnlyAllowed();
    };

    it("should not revert", async () => {
      await expect(subject()).to.not.be.reverted;
    });

    describe("when the caller is not allowed", async () => {
      beforeEach(async () => {
        subjectCaller = allowedTwo;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Address is not allowed");
      });
    });

    describe("when the allowlist is disabled", async () => {
      beforeEach(async () => {
        await allowList.connect(owner.wallet).disableAllowlist();
        subjectCaller = allowedTwo;
      });

      it("should not revert", async () => {
        await expect(subject()).to.not.be.reverted;
      });
    });
  });

  describe("#addAddressesToAllowlist", async () => {
    let subjectAllowedAddresses: Address[];
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectAllowedAddresses = [allowedTwo.address];
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await allowList.connect(subjectCaller.wallet).addAddressesToAllowlist(subjectAllowedAddresses);
    };

    it("should add the allowed address", async () => {
      await subject();

      const actualAllowed = await allowList.getAllowedAddresses();
      const isAllowed = await allowList.isAllowed(allowedTwo.address);

      expect(JSON.stringify(actualAllowed)).to.equal(JSON.stringify([allowedOne.address, allowedTwo.address]));
      expect(isAllowed).to.be.true;
    });

    it("should emit the correct AddressAddedToAllowlist event", async () => {
      await expect(subject()).to.emit(allowList, "AddressAddedToAllowlist").withArgs(
        allowedTwo.address
      );
    });

    describe("when the address is already allowed", async () => {
      beforeEach(async () => {
        subjectAllowedAddresses = [allowedOne.address];
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Address already on allowlist");
      });
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = allowedTwo;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#removeAddressesFromAllowlist", async () => {
    let subjectDisallowedAddresses: Address[];
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectDisallowedAddresses = [allowedOne.address];
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await allowList.connect(subjectCaller.wallet).removeAddressesFromAllowlist(subjectDisallowedAddresses);
    };

    it("should remove the allowed address", async () => {
      await subject();

      const actualAllowed = await allowList.getAllowedAddresses();
      const isAllowed = await allowList.isAllowed(allowedOne.address);

      expect(actualAllowed).to.be.empty;
      expect(isAllowed).to.be.false;
    });

    it("should emit the correct AddressAddedToAllowlist event", async () => {
      await expect(subject()).to.emit(allowList, "AddressRemovedFromAllowlist").withArgs(
        allowedOne.address
      );
    });

    describe("when the address is already disallowed", async () => {
      beforeEach(async () => {
        subjectDisallowedAddresses = [allowedTwo.address];
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Address already disallowed");
      });
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = allowedTwo;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#enableAllowlist", async () => {
    let subjectCaller: Account;

    beforeEach(async () => {
      await allowList.connect(owner.wallet).disableAllowlist();

      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await allowList.connect(subjectCaller.wallet).enableAllowlist();
    };

    it("should enable the allowlist", async () => {
      await subject();

      const isEnabled = await allowList.isEnabled();
      expect(isEnabled).to.be.true;
    });

    it("should emit the correct AllowlistEnabled event", async () => {
      await expect(subject()).to.emit(allowList, "AllowlistEnabled").withArgs();
    });

    describe("when the allow list is already enabled", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Allow list is already enabled");
      });
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = allowedTwo;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#disableAllowlist", async () => {
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return await allowList.connect(subjectCaller.wallet).disableAllowlist();
    };

    it("should disable the allowlist", async () => {
      const preIsEnabled = await allowList.isEnabled();
      expect(preIsEnabled).to.be.true;

      await subject();

      const isEnabled = await allowList.isEnabled();
      expect(isEnabled).to.be.false;
    });

    it("should emit the correct AllowlistEnabled event", async () => {
      await expect(subject()).to.emit(allowList, "AllowlistDisabled").withArgs();
    });

    describe("when the allow list is already disabled", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Allow list is already disabled");
      });
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = allowedTwo;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
