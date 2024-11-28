import "module-alias/register";

import { Account } from "@utils/test/types";
import { HDFCTimestampParsingMock } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { BigNumber } from "ethers";
import { ONE, ZERO } from "@utils/constants";

const expect = getWaffleExpect();

describe("HDFCTimestampParsing", () => {
  let owner: Account;

  let timestampParsingMock: HDFCTimestampParsingMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    timestampParsingMock = await deployer.deployHDFCTimestampParsingMock();
  });

  describe("#dateStringToTimestamp", async () => {
    let subjectDateString: string;

    beforeEach(async () => {
      subjectDateString = "Wed, 17 Jan 2024 08:58:01 +0530";
    });

    async function subject(): Promise<any> {
      return await timestampParsingMock.dateStringToTimestamp(subjectDateString);
    }

    it("should return the correct value", async () => {
      const output = await subject();

      // 1705481881 - 19800
      expect(output).to.equal(BigNumber.from(1705462081));
    });

    describe("when the passed in date string has too many extracted strings", async () => {
      beforeEach(async () => {
        subjectDateString = "Wed, 17 Jan 2024 08:58:01 +0530 5"
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Panic");
      });
    });

    describe("when the passed in date string does not have enough extracted strings", async () => {
      beforeEach(async () => {
        subjectDateString = "Wed, 17 Jan 2024 08:58:01"
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid date string");
      });
    });
  });

  describe("#calculateTimestampWithOffset", async () => {
    let subjectUnOffsetTimestamp: BigNumber;
    let subjectTimeOffsetString: string;

    beforeEach(async () => {
      subjectUnOffsetTimestamp = BigNumber.from(1705481881);
      subjectTimeOffsetString = "+0530";
    });

    async function subject(): Promise<any> {
      return await timestampParsingMock._calculateTimestampWithOffset(subjectUnOffsetTimestamp, subjectTimeOffsetString);
    }

    it("should return the correct value", async () => {
      const output = await subject();

      expect(output).to.equal(BigNumber.from(1705462081));
    });

    describe("when the passed offset string does not start with a +", async () => {
      beforeEach(async () => {
        subjectTimeOffsetString = "-0530";
      });

      it("should calculate the correct timestamp with offset", async () => {
        const output = await subject();

        expect(output).to.equal(BigNumber.from(1705501681));
      });
    });

    describe("when the passed offset string is malformed", async () => {
      beforeEach(async () => {
        subjectTimeOffsetString = "+05300";
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid timezone offset");
      });
    });
  });
});
