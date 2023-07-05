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
import { Blockchain, ether, usdc } from "@utils/common";
import { BigNumber } from "ethers";
import { ZERO, ZERO_BYTES32 } from "@utils/constants";
import { calculateDepositHash, calculateIntentHash } from "@utils/protocolUtils";
import { ONE_DAY_IN_SECONDS } from "@utils/constants";

const expect = getWaffleExpect();

const blockchain = new Blockchain(ethers.provider);

describe.only("Ramp", () => {
  let owner: Account;
  let offRamper: Account;
  let onRamper: Account;

  let ramp: Ramp;
  let usdcToken: USDCMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      offRamper,
      onRamper
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    usdcToken = await deployer.deployUSDCMock(usdc(1000000000), "USDC", "USDC");

    await usdcToken.transfer(offRamper.address, usdc(10000));

    ramp = await deployer.deployRamp(owner.address, await usdcToken.address);
  });

  describe("#constructor", async () => {
    it("should set the correct owner", async () => {
      const ownerAddress: Address = await ramp.owner();
      expect(ownerAddress).to.eq(owner.address);
    });

    it("should set the correct usdc", async () => {
      const usdcAddress: Address = await ramp.usdc();
      expect(usdcAddress).to.eq(usdcToken.address);
    });
  });

  describe("#register", async () => {
    let subjectPubInputs: string[];
    let subjectProof: string;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectPubInputs = [ethers.utils.formatBytes32String("proofOfVenmo")];
      subjectProof = "0x01";
      subjectCaller = offRamper;
    });

    async function subject(): Promise<any> {
      return ramp.connect(subjectCaller.wallet).register(subjectPubInputs, subjectProof);
    }

    it("should register the caller", async () => {
      await subject();

      const offRamperAddress = await ramp.accountIds(subjectPubInputs[0]);
      expect(offRamperAddress).to.eq(subjectCaller.address);
    });

    it("should emit an AccountRegistered event", async () => {
      await expect(subject()).to.emit(ramp, "AccountRegistered").withArgs(subjectPubInputs[0], subjectCaller.address);
    });

    describe("when the caller is already registered", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Account already registered");
      });
    });
  });

  context("when the on and off ramper are registered", async () => {
    beforeEach(async () => {
      await ramp.connect(offRamper.wallet).register([ethers.utils.formatBytes32String("proofOfVenmo")], "0x01");
      await ramp.connect(onRamper.wallet).register([ethers.utils.formatBytes32String("proofOfVenmoTwo")], "0x01");

      await usdcToken.connect(offRamper.wallet).approve(ramp.address, usdc(10000));
    });

    describe("offRamp", async () => {
      let subjectVenmoId: string;
      let subjectDepositAmount: BigNumber;
      let subjectReceiveAmount: BigNumber;
      let subjectConvenienceFee: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectVenmoId = ethers.utils.formatBytes32String("proofOfVenmo");
        subjectDepositAmount = usdc(100);
        subjectReceiveAmount = usdc(101);
        subjectConvenienceFee = usdc(2);
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).offRamp(subjectVenmoId, subjectDepositAmount, subjectReceiveAmount, subjectConvenienceFee);
      }

      it("should transfer the usdc to the Ramp contract", async () => {
        await subject();

        const rampUsdcBalance = await usdcToken.balanceOf(ramp.address);
        const offRamperUsdcBalance = await usdcToken.balanceOf(offRamper.address);
        expect(rampUsdcBalance).to.eq(subjectDepositAmount);
        expect(offRamperUsdcBalance).to.eq(usdc(9900));
      });

      it("should correctly update the deposits mapping with the correct key hash", async () => {
        await subject();

        const conversionRate = subjectDepositAmount.mul(ether(1)).div(subjectReceiveAmount);
        const depositHash = calculateDepositHash(subjectVenmoId, conversionRate, subjectConvenienceFee);

        const deposit = await ramp.getDeposit(depositHash);

        expect(deposit.depositor).to.eq(subjectVenmoId);
        expect(deposit.remainingDeposits).to.eq(subjectDepositAmount);
        expect(deposit.outstandingIntentAmount).to.eq(ZERO);
        expect(deposit.conversionRate).to.eq(conversionRate);
        expect(deposit.convenienceFee).to.eq(subjectConvenienceFee);
      });

      it("should emit a DepositReceived event", async () => {
        const conversionRate = subjectDepositAmount.mul(ether(1)).div(subjectReceiveAmount);
        const depositHash = calculateDepositHash(subjectVenmoId, conversionRate, subjectConvenienceFee);

        await expect(subject()).to.emit(ramp, "DepositReceived").withArgs(
          depositHash,
          subjectVenmoId,
          subjectDepositAmount,
          conversionRate,
          subjectConvenienceFee
        );
      });

      describe("when the deposit hash already exists", async () => {
        beforeEach(async () => {
          await subject();
        });

        it("should update the remainingDeposits param", async () => {
          await subject();

          const conversionRate = subjectDepositAmount.mul(ether(1)).div(subjectReceiveAmount);
          const depositHash = calculateDepositHash(subjectVenmoId, conversionRate, subjectConvenienceFee);

          const deposit = await ramp.getDeposit(depositHash);

          expect(deposit.remainingDeposits).to.eq(subjectDepositAmount.mul(2));
        });
      });

      describe("when the caller is not the address associated with the account", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender must be the account owner");
        });
      });

      describe("when the deposited amount is zero", async () => {
        beforeEach(async () => {
          subjectDepositAmount = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Deposit amount must be greater than 0");
        });
      });

      describe("when the receive amount is zero", async () => {
        beforeEach(async () => {
          subjectReceiveAmount = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Receive amount must be greater than 0");
        });
      });
    });

    describe("signalIntent", async () => {
      let subjectVenmoId: string;
      let subjectDepositHash: string;
      let subjectAmount: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(100),
          usdc(101),
          usdc(2)
        );

        const conversionRate = usdc(100).mul(ether(1)).div(usdc(101));

        subjectVenmoId = ethers.utils.formatBytes32String("proofOfVenmoTwo");
        subjectDepositHash = calculateDepositHash(ethers.utils.formatBytes32String("proofOfVenmo"), conversionRate, usdc(2));
        subjectAmount = usdc(50);
        subjectCaller = onRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).signalIntent(subjectVenmoId, subjectDepositHash, subjectAmount);
      }

      it("should create the correct entry in the intents mapping", async () => {
        await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositHash, currentTimestamp);

        const intent = await ramp.intents(intentHash);

        expect(intent.onramper).to.eq(subjectVenmoId);
        expect(intent.deposit).to.eq(subjectDepositHash);
        expect(intent.amount).to.eq(subjectAmount);
        expect(intent.intentTimestamp).to.eq(currentTimestamp);
      });

      it("should update the deposit mapping correctly", async () => {
        const preDeposit = await ramp.getDeposit(subjectDepositHash);

        await subject();

        const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositHash, await blockchain.getCurrentTimestamp());

        const postDeposit = await ramp.getDeposit(subjectDepositHash);

        expect(postDeposit.outstandingIntentAmount).to.eq(preDeposit.outstandingIntentAmount.add(subjectAmount));
        expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.sub(subjectAmount));
        expect(postDeposit.intentHashes).to.include(intentHash);
      });

      it("should emit an IntentSignaled event", async () => {
        const txn = await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositHash, currentTimestamp);

        expect(txn).to.emit(ramp, "IntentSignaled").withArgs(
          intentHash,
          subjectDepositHash,
          subjectVenmoId,
          subjectAmount,
          currentTimestamp
        );
      });

      describe("when there aren't enough deposits to cover requested amount ", async () => {
        let timeJump: number;
        let oldIntentHash: string;

        before(async () => {
          timeJump = ONE_DAY_IN_SECONDS.add(1).toNumber();
        });

        beforeEach(async () => {
          await subject();

          const currentTimestamp = await blockchain.getCurrentTimestamp();
          oldIntentHash = calculateIntentHash(subjectVenmoId, subjectDepositHash, currentTimestamp);

          await blockchain.increaseTimeAsync(timeJump);

          subjectAmount = usdc(60);
        });

        it("should prune the intent and update the rest of the deposit mapping correctly", async () => {
          const preDeposit = await ramp.getDeposit(subjectDepositHash);

          expect(preDeposit.intentHashes).to.include(oldIntentHash);

          await subject();

          const newIntentHash = calculateIntentHash(subjectVenmoId, subjectDepositHash, await blockchain.getCurrentTimestamp());
          const postDeposit = await ramp.getDeposit(subjectDepositHash);

          expect(postDeposit.outstandingIntentAmount).to.eq(subjectAmount);
          expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.sub(usdc(10))); // 10 usdc difference between old and new intent
          expect(postDeposit.intentHashes).to.include(newIntentHash);
          expect(postDeposit.intentHashes).to.not.include(oldIntentHash);
        });

        it("should delete the original intent from the intents mapping", async () => {
          await subject();
  
          const intent = await ramp.intents(oldIntentHash);
  
          expect(intent.onramper).to.eq(ZERO_BYTES32);
          expect(intent.deposit).to.eq(ZERO_BYTES32);
          expect(intent.amount).to.eq(ZERO);
          expect(intent.intentTimestamp).to.eq(ZERO);
        });

        it("should correctly add a new intent to the intents mapping", async () => {
          await subject();

          const currentTimestamp = await blockchain.getCurrentTimestamp();
          const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositHash, currentTimestamp);
  
          const intent = await ramp.intents(intentHash);
  
          expect(intent.onramper).to.eq(subjectVenmoId);
          expect(intent.deposit).to.eq(subjectDepositHash);
          expect(intent.amount).to.eq(subjectAmount);
          expect(intent.intentTimestamp).to.eq(currentTimestamp);
        });

        it("should emit an IntentPruned event", async () => {
          await expect(subject()).to.emit(ramp, "IntentPruned").withArgs(oldIntentHash, subjectDepositHash);
        });

        describe("when the reclaimable amount can't cover the new intent", async () => {
          before(async () => {
            timeJump = ONE_DAY_IN_SECONDS.div(2).toNumber();
          });

          after(async () => {
            timeJump = ONE_DAY_IN_SECONDS.add(1).toNumber();
          });

          it("should revert", async () => {
            await expect(subject()).to.be.revertedWith("Not enough liquidity");
          });
        });
      });

      describe("when the amount is zero", async () => {
        beforeEach(async () => {
          subjectAmount = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Signaled amount must be greater than 0");
        });
      });
      
      describe("when the caller is not the address associated with the account", async () => {
        beforeEach(async () => {
          subjectCaller = offRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender must be the account owner");
        });
      });
    });
  });
});
