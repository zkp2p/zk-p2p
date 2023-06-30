import "module-alias/register";

import { ethers } from "hardhat";

import {
  Address,
} from "@utils/types";
import { Account } from "@utils/test/types";
import { Ramp, USDCMock } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Blockchain } from "@utils/common";

const expect = getWaffleExpect();

const blockchain = new Blockchain(ethers.provider);

describe.only("Ramp", () => {
  let owner: Account;

  let ramp: Ramp;
  let usdc: USDCMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    console.log(ethers.utils.parseUnits("1000000000", 6));
    usdc = await deployer.deployUSDCMock(ethers.utils.parseUnits("1000000000", 6), "USDC", "USDC");
    ramp = await deployer.deployRamp(owner.address, await usdc.address);
  });

  describe("#constructor", async () => {
    it("should set the correct owner", async () => {
      const ownerAddress: Address = await ramp.owner();
      expect(ownerAddress).to.eq(owner.address);
    });

    it("should set the correct usdc", async () => {
      const usdcAddress: Address = await ramp.usdc();
      expect(usdcAddress).to.eq(usdc.address);
    });
  });
});
