import "module-alias/register";

import { Account } from "@utils/test/types";
import { WiseTimestampParsingMock } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { BigNumber } from "ethers";

const expect = getWaffleExpect();

describe("WiseTimestampParsing", () => {
  let owner: Account;

  let timestampParsingMock: WiseTimestampParsingMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    timestampParsingMock = await deployer.deployWiseTimestampParsingMock();
  });

  describe("#dateStringToTimestamp", async () => {
    let subjectDateString: string;

    beforeEach(async () => {
      subjectDateString = "2023-07-10 18:10:04";
    });

    async function subject(): Promise<any> {
      return await timestampParsingMock.dateStringToTimestamp(subjectDateString);
    }

    it("should return the correct value", async () => {
      const output = await subject();

      expect(output).to.equal(BigNumber.from(1689012604));
    });

    describe("when the passed in date string has too many extracted strings", async () => {
      beforeEach(async () => {
        subjectDateString = "2023-07-10 18:10:04:30";
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Panic");
      });
    });

    describe("when the passed in date string does not have enough extracted strings", async () => {
      beforeEach(async () => {
        subjectDateString = "2023-07-10 18:10";
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid date string");
      });
    });
  });
});
