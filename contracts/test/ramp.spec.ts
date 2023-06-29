import "module-alias/register";

import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers";

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
const blockchain = new Blockchain(new JsonRpcProvider());

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
    console.log(ethers.parseUnits("1000000000", 6));
    usdc = await deployer.deployUSDCMock(ethers.parseUnits("1000000000", 6), "USDC", "USDC");
    ramp = await deployer.deployRamp(owner.address, await usdc.getAddress());
  });
});
