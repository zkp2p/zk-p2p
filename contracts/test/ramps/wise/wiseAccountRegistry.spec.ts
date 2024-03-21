import "module-alias/register";

import {
  Address,
  WiseOffRamperRegistrationData,
  WiseOffRamperRegistrationProof,
  WiseRegistrationData,
  WiseRegistrationProof,
} from "@utils/types";
import { Account } from "@utils/test/types";
import {
  WiseAccountRegistry,
  USDCMock,
  WiseAccountRegistrationProcessorMock,
  WiseOffRamperRegistrationProcessorMock,
} from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";
import { BigNumber } from "ethers";
import { calculateWiseId, calculateWiseTagHash } from "@utils/protocolUtils";

const expect = getWaffleExpect();

describe.only("WiseAccountRegistry", () => {
  let owner: Account;
  let offRamper: Account;
  let unregisteredUser: Account;

  let accountRegistry: WiseAccountRegistry;
  let usdcToken: USDCMock;
  let accountRegistrationProcessor: WiseAccountRegistrationProcessorMock;
  let offRamperRegistrationProcessor: WiseOffRamperRegistrationProcessorMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      offRamper,
      unregisteredUser,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    usdcToken = await deployer.deployUSDCMock(usdc(1000000000), "USDC", "USDC");
    accountRegistrationProcessor = await deployer.deployWiseAccountRegistrationProcessorMock();
    offRamperRegistrationProcessor = await deployer.deployWiseOffRamperRegistrationProcessorMock();

    await usdcToken.transfer(offRamper.address, usdc(10000));

    accountRegistry = await deployer.deployWiseAccountRegistry(
      owner.address
    );
  });

  describe("#constructor", async () => {
    it("should set the correct owner", async () => {
      const ownerAddress: Address = await accountRegistry.owner();
      expect(ownerAddress).to.eq(owner.address);
    });
  });

  describe("#initialize", async () => {
    let subjectAccountRegistrationProcessor: Address;
    let subjectOffRamperRegistrationProcessor: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectAccountRegistrationProcessor = accountRegistrationProcessor.address;
      subjectOffRamperRegistrationProcessor = offRamperRegistrationProcessor.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return accountRegistry.connect(subjectCaller.wallet).initialize(
        subjectAccountRegistrationProcessor,
        subjectOffRamperRegistrationProcessor,
      );
    }

    it("should set the correct processor addresses", async () => {
      await subject();

      const accountRegistrationProcessorAddress: Address = await accountRegistry.accountRegistrationProcessor();
      const offRamperRegistrationProcessorAddress: Address = await accountRegistry.offRamperRegistrationProcessor();

      expect(accountRegistrationProcessorAddress).to.eq(accountRegistrationProcessor.address);
      expect(offRamperRegistrationProcessorAddress).to.eq(offRamperRegistrationProcessor.address);
    });

    describe("when the contract has already been initialized", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Already initialized");
      });
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = offRamper;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#register", async () => {
    let subjectProof: WiseRegistrationProof;
    let subjectCaller: Account;

    beforeEach(async () => {
      await accountRegistry.initialize(
        accountRegistrationProcessor.address,
        offRamperRegistrationProcessor.address
      );

      const registerPublicValues = {
        endpoint: "GET https://api.transferwise.com/v4/profiles/41246868/multi-currency-account",
        host: "api.transferwise.com",
        profileId: "405394441",
        wiseTagHash: calculateWiseTagHash("jdoe1234")
      } as WiseRegistrationData

      subjectProof = {
        public_values: registerPublicValues,
        proof: "0x"
      } as WiseRegistrationProof;

      subjectCaller = offRamper;
    });

    async function subject(): Promise<any> {
      return accountRegistry.connect(subjectCaller.wallet).register(subjectProof);
    }

    it("should register the caller", async () => {
      await subject();
      const accountInfo = await accountRegistry.getAccountInfo(subjectCaller.address);

      expect(accountInfo.accountId).to.eq(calculateWiseId(subjectProof.public_values.profileId));
      expect(accountInfo.wiseTagHash).to.eq(BigNumber.from(subjectProof.public_values.wiseTagHash).toHexString());
    });

    it("should emit an AccountRegistered event", async () => {
      await expect(subject()).to.emit(accountRegistry, "AccountRegistered").withArgs(
        subjectCaller.address,
        calculateWiseId(subjectProof.public_values.profileId),
        calculateWiseId(subjectProof.public_values.wiseTagHash)
      );
    });

    describe("when the caller is already registered", async () => {
      beforeEach(async () => {
        await subject();

        subjectProof.public_values.profileId = "455324471";
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Account already associated with accountId");
      });
    });
  });

  context("when the user is registered", async () => {

    let offRamperProof: WiseRegistrationProof;
    let onRamperProof: WiseRegistrationProof;

    beforeEach(async () => {
      await accountRegistry.initialize(
        accountRegistrationProcessor.address,
        offRamperRegistrationProcessor.address
      );

      const standardRegistrationData: WiseRegistrationData = {
        endpoint: "GET https://api.transferwise.com/v4/profiles/41246868/multi-currency-account",
        host: "api.transferwise.com",
        profileId: "",
        wiseTagHash: ""
      }
      offRamperProof = { public_values: {...standardRegistrationData}, proof: "0x"};
      offRamperProof.public_values.profileId = "012345678";
      offRamperProof.public_values.wiseTagHash = calculateWiseTagHash("jdoe1234");
      onRamperProof = { public_values: {...standardRegistrationData}, proof: "0x"};
      onRamperProof.public_values.profileId = "123456789";

      await accountRegistry.connect(offRamper.wallet).register(offRamperProof);
    });

    describe("#registerAsOffRamper", async () => {
      let subjectProof: WiseOffRamperRegistrationProof;
      let subjectCaller: Account;
  
      beforeEach(async () => {
        const registerPublicValues = {
          endpoint: "GET https://api.transferwise.com/v4/profiles/41246868/multi-currency-account",
          host: "api.transferwise.com",
          profileId: "012345678",
          mcAccountId: "402767982"
        } as WiseOffRamperRegistrationData
  
        subjectProof = { public_values: registerPublicValues, proof: "0x"};
  
        subjectCaller = offRamper;
      });
  
      async function subject(): Promise<any> {
        return accountRegistry.connect(subjectCaller.wallet).registerAsOffRamper(
          subjectProof
        );
      }
  
      it("should register the caller", async () => {
        await subject();
        const accountInfo = await accountRegistry.getAccountInfo(subjectCaller.address);
  
        expect(accountInfo.accountId).to.eq(calculateWiseId(subjectProof.public_values.profileId));
        expect(accountInfo.offRampId).to.eq(calculateWiseId(subjectProof.public_values.mcAccountId));
      });
  
      it("should emit an OffRamperRegistered event", async () => {
        await expect(subject()).to.emit(accountRegistry, "OffRamperRegistered").withArgs(
          subjectCaller.address,
          calculateWiseId(subjectProof.public_values.profileId),
          calculateWiseId(subjectProof.public_values.mcAccountId)
        );
      });
  
      describe("when the caller is not a registered user", async () => {
        beforeEach(async () => {
          subjectCaller = unregisteredUser;
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be registered user");
        });
      });
  
      describe("when the profileId doesn't match the registered profileId for the account", async () => {
        beforeEach(async () => {
          subjectProof.public_values.profileId = "454389071";
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("OnRampId does not match");
        });
      });
  
      describe("when the caller is already registered", async () => {
        beforeEach(async () => {
          await subject();
  
          subjectProof.public_values.profileId = "455324471";
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Account already associated with offRampId");
        });
      });
    });
  
    describe("#addAccountToDenylist", async () => {
      let subjectDeniedUser: string;
      let subjectCaller: Account;
  
      beforeEach(async () => {
        subjectDeniedUser = calculateWiseId(onRamperProof.public_values.profileId);
        subjectCaller = offRamper;
      });
  
      async function subject(): Promise<any> {
        return accountRegistry.connect(subjectCaller.wallet).addAccountToDenylist(subjectDeniedUser);
      }
  
      it("should add the denied user to the denier's array and update mapping", async () => {
        await subject();
  
        const deniedUsers = await accountRegistry.getDeniedUsers(subjectCaller.address);
        const isDenied = await accountRegistry.isDeniedUser(subjectCaller.address, subjectDeniedUser);
  
        expect(deniedUsers).to.include(subjectDeniedUser);
        expect(isDenied).to.be.true;
      });
  
      it("should emit a UserAddedToDenylist event", async () => {
        const tx = await subject();
  
        expect(tx).to.emit(accountRegistry, "UserAddedToDenylist").withArgs(
          calculateWiseId(offRamperProof.public_values.profileId),
          calculateWiseId(onRamperProof.public_values.profileId)
        );
      });
  
      describe("when the denied user is already on the denylist", async () => {
        beforeEach(async () => {
          await subject();
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("User already on denylist");
        });
      });
  
      describe("when the caller is not a registered user", async () => {
        beforeEach(async () => {
          subjectCaller = unregisteredUser;
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be registered user");
        });
      });
    });
  
    describe("#removeAccountFromDenylist", async () => {
      let subjectApprovedUser: string;
      let subjectCaller: Account;
  
      beforeEach(async () => {
        await accountRegistry.connect(offRamper.wallet).addAccountToDenylist(calculateWiseId(onRamperProof.public_values.profileId));
  
        subjectApprovedUser = calculateWiseId(onRamperProof.public_values.profileId);
        subjectCaller = offRamper;
      });
  
      async function subject(): Promise<any> {
        return accountRegistry.connect(subjectCaller.wallet).removeAccountFromDenylist(subjectApprovedUser);
      }
  
      it("should remove the denied user from the denier's array and update mapping", async () => {
        const preDeniedUsers = await accountRegistry.getDeniedUsers(subjectCaller.address);
  
        expect(preDeniedUsers).to.include(subjectApprovedUser);
  
        await subject();
  
        const deniedUsers = await accountRegistry.getDeniedUsers(subjectCaller.address);
        const isDenied = await accountRegistry.isDeniedUser(subjectCaller.address, subjectApprovedUser);
  
        expect(deniedUsers).to.not.include(subjectApprovedUser);
        expect(isDenied).to.be.false;
      });
  
      it("should emit a UserRemovedFromDenylist event", async () => {
        const tx = await subject();
  
        expect(tx).to.emit(accountRegistry, "UserRemovedFromDenylist").withArgs(
          calculateWiseId(offRamperProof.public_values.profileId),
          calculateWiseId(onRamperProof.public_values.profileId)
        );
      });
  
      describe("when the denied user is not already on the denylist", async () => {
        beforeEach(async () => {
          await subject();
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("User not on denylist");
        });
      });
  
      describe("when the caller is not a registered user", async () => {
        beforeEach(async () => {
          subjectCaller = unregisteredUser;
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be registered user");
        });
      });
    });
  });

  describe("#setAccountRegistrationProcessor", async () => {
    let subjectRegistrationProcessor: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectRegistrationProcessor = owner.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return accountRegistry.connect(subjectCaller.wallet).setAccountRegistrationProcessor(subjectRegistrationProcessor);
    }

    it("should set the correct account registration processor", async () => {
      await subject();

      const newRegistrationProcessor = await accountRegistry.accountRegistrationProcessor();

      expect(newRegistrationProcessor).to.eq(subjectRegistrationProcessor);
    });

    it("should emit a NewAccountRegistrationProcessorSet event", async () => {
      const tx = await subject();

      expect(tx).to.emit(accountRegistry, "NewAccountRegistrationProcessorSet").withArgs(subjectRegistrationProcessor);
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = offRamper;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#setOffRamperRegistrationProcessor", async () => {
    let subjectRegistrationProcessor: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectRegistrationProcessor = owner.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return accountRegistry.connect(subjectCaller.wallet).setOffRamperRegistrationProcessor(subjectRegistrationProcessor);
    }

    it("should set the correct off ramper registration processor", async () => {
      await subject();

      const newRegistrationProcessor = await accountRegistry.offRamperRegistrationProcessor();

      expect(newRegistrationProcessor).to.eq(subjectRegistrationProcessor);
    });

    it("should emit a NewOffRamperRegistrationProcessorSet event", async () => {
      const tx = await subject();

      expect(tx).to.emit(accountRegistry, "NewOffRamperRegistrationProcessorSet").withArgs(subjectRegistrationProcessor);
    });

    describe("when the caller is not the owner", async () => {
      beforeEach(async () => {
        subjectCaller = offRamper;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
