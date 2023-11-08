import "module-alias/register";

import { ethers } from "hardhat";

import { Account } from "@utils/test/types";
import { StringConversionUtilsMock } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { BigNumber } from "ethers";
import { ONE, ZERO } from "@utils/constants";

const expect = getWaffleExpect();

describe("StringConversionUtils", () => {
  let owner: Account;

  let stringUtils: StringConversionUtilsMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    stringUtils = await deployer.deployStringConversionUtilsMock();
  });

  describe("#stringToUint", async () => {
    let subjectString: string;
    let subjectDesiredDecimals: BigNumber;

    beforeEach(async () => {
      subjectString = "123.456";
      subjectDesiredDecimals = BigNumber.from(5);
    });

    async function subject(): Promise<any> {
      return await stringUtils.stringToUint(subjectString, subjectDesiredDecimals);
    }

    it("should return the correct value", async () => {
      const output = await subject();

      expect(output).to.equal(BigNumber.from(12345600));
    });

    describe("when the amount of decimals equals the amount of decimals in the string", async () => {
      beforeEach(async () => {
        subjectDesiredDecimals = BigNumber.from(3);
      });

      it("should return the correct value", async () => {
        const output = await subject();
  
        expect(output).to.equal(BigNumber.from(123456));
      });
    });

    describe("when the desired decimals is 0 and no decimal is found", async () => {
      beforeEach(async () => {
        subjectString = "120459"
        subjectDesiredDecimals = ZERO
      });

      it("should return the correct value", async () => {
        const output = await subject();
  
        expect(output).to.equal(BigNumber.from(120459));
      });
    });

    describe("when the desired decimals is 0 and a decimal is found at the very end", async () => {
      beforeEach(async () => {
        subjectString = "123456."
        subjectDesiredDecimals = ZERO
      });

      it("should return the correct value", async () => {
        const output = await subject();
  
        expect(output).to.equal(BigNumber.from(123456));
      });
    });

    describe("when passed string has more decimal places than the desired decimals", async () => {
      beforeEach(async () => {
        subjectDesiredDecimals = ONE;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("String has too many decimal places");
      });
    });

    describe("when passed string has more than one decimal point", async () => {
      beforeEach(async () => {
        subjectString = "123.45.6";
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("String has multiple decimals");
      });
    });
  });
});
