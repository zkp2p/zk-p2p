import "module-alias/register";

import { Account } from "@utils/test/types";
import { TMTimestampParsingMock } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { BigNumber } from "ethers";

const expect = getWaffleExpect();

describe("TMTimestampParsing", () => {
  let owner: Account;

  let timestampParsingMock: TMTimestampParsingMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    timestampParsingMock = await deployer.deployTMTimestampParsingMock();
  });

  describe("#dateStringToTimestamp", async () => {
    let subjectDateString: string;

    beforeEach(async () => {
      subjectDateString = "2024-07-04T02:00:00Z";
    });

    async function subject(): Promise<any> {
      return await timestampParsingMock.dateStringToTimestamp(subjectDateString);
    }

    it("should return the correct value", async () => {
      const output = await subject();

      expect(output).to.equal(BigNumber.from(1720058400));
    });

    describe("when the passed in date string has too many extracted strings", async () => {
      beforeEach(async () => {
        subjectDateString = "2024-07-04T02:00:00-Z"
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Panic");
      });
    });

    describe("when the passed in date string does not have enough extracted strings", async () => {
      beforeEach(async () => {
        subjectDateString = "2024-07-04T02:00"
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Invalid date string");
      });
    });
  });
});
