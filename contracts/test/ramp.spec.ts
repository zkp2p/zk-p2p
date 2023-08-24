import "module-alias/register";

import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

import {
  Address,
} from "@utils/types";
import { Account } from "@utils/test/types";
import {
  Ramp,
  USDCMock,
  VenmoReceiveProcessorMock,
  VenmoRegistrationProcessorMock,
  VenmoSendProcessorMock
} from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Blockchain, ether, usdc } from "@utils/common";
import { BigNumber } from "ethers";
import { ZERO, ZERO_BYTES32, ADDRESS_ZERO, ONE } from "@utils/constants";
import { calculateIntentHash } from "@utils/protocolUtils";
import { ONE_DAY_IN_SECONDS } from "@utils/constants";

const expect = getWaffleExpect();

const blockchain = new Blockchain(ethers.provider);

describe("Ramp", () => {
  let owner: Account;
  let offRamper: Account;
  let onRamper: Account;
  let onRamperTwo: Account;
  let maliciousOnRamper: Account;

  let ramp: Ramp;
  let usdcToken: USDCMock;
  let receiveProcessor: VenmoReceiveProcessorMock;
  let registrationProcessor: VenmoRegistrationProcessorMock;
  let sendProcessor: VenmoSendProcessorMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      offRamper,
      onRamper,
      onRamperTwo,
      maliciousOnRamper
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    usdcToken = await deployer.deployUSDCMock(usdc(1000000000), "USDC", "USDC");
    receiveProcessor = await deployer.deployVenmoReceiveProcessorMock();
    registrationProcessor = await deployer.deployVenmoRegistrationProcessorMock();
    sendProcessor = await deployer.deployVenmoSendProcessorMock();

    await usdcToken.transfer(offRamper.address, usdc(10000));

    ramp = await deployer.deployRamp(
      owner.address,
      usdcToken.address,
      receiveProcessor.address,
      registrationProcessor.address,
      sendProcessor.address,
      usdc(20)                          // $20 min deposit amount
    );
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

    it("should set the correct receiveProcessor", async () => {
      const receiveProcessorAddress: Address = await ramp.receiveProcessor();
      expect(receiveProcessorAddress).to.eq(receiveProcessor.address);
    });

    it("should set the correct registrationProcessor", async () => {
      const registrationProcessorAddress: Address = await ramp.registrationProcessor();
      expect(registrationProcessorAddress).to.eq(registrationProcessor.address);
    });

    it("should set the correct sendProcessor", async () => {
      const sendProcessorAddress: Address = await ramp.sendProcessor();
      expect(sendProcessorAddress).to.eq(sendProcessor.address);
    });

    it("should set the correct min deposit amount", async () => {
      const minDepositAmount: BigNumber = await ramp.minDepositAmount();
      expect(minDepositAmount).to.eq(usdc(20));
    });

    it("should set the correct convenience reward tme period", async () => {
      const minDepositAmount: BigNumber = await ramp.convenienceRewardTimePeriod();
      expect(minDepositAmount).to.eq(BigNumber.from(10));
    });
  });

  describe("#register", async () => {
    let subjectA: [BigNumber, BigNumber];
    let subjectB: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
    let subjectC: [BigNumber, BigNumber];
    let subjectSignals: BigNumber[];
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectSignals = new Array<BigNumber>(45).fill(ZERO);
      subjectSignals[0] = BigNumber.from(1);
      subjectSignals[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoTwo"));

      subjectA = [ZERO, ZERO];
      subjectB = [[ZERO, ZERO], [ZERO, ZERO]];
      subjectC = [ZERO, ZERO];
      subjectCaller = offRamper;
    });

    async function subject(): Promise<any> {
      return ramp.connect(subjectCaller.wallet).register(subjectA, subjectB, subjectC, subjectSignals);
    }

    it("should register the caller", async () => {
      await subject();

      const offRamperVenmoId = await ramp.accounts(subjectCaller.address);
      expect(offRamperVenmoId).to.eq(subjectSignals[1]);
    });

    it("should emit an AccountRegistered event", async () => {
      await expect(subject()).to.emit(ramp, "AccountRegistered").withArgs(subjectCaller.address, ethers.utils.formatBytes32String("proofOfVenmoTwo"));
    });

    describe("when the caller is already registered", async () => {
      beforeEach(async () => {
        await subject();

        subjectSignals[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoThree"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Account already associated with venmoId");
      });
    });
  });

  context("when the on and off ramper are registered", async () => {
    beforeEach(async () => {
      const _a: [BigNumber, BigNumber] = [ZERO, ZERO];
      const _b: [[BigNumber, BigNumber], [BigNumber, BigNumber]] = [[ZERO, ZERO], [ZERO, ZERO]];
      const _c: [BigNumber, BigNumber] = [ZERO, ZERO];

      const signalsOffRamp = new Array<BigNumber>(45).fill(ZERO);
      signalsOffRamp[0] = ZERO;
      signalsOffRamp[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmo"));

      const signalsOnRamp = new Array<BigNumber>(45).fill(ZERO);
      signalsOnRamp[0] = ZERO;
      signalsOnRamp[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoTwo"));

      const signalsOnRampTwo = new Array<BigNumber>(45).fill(ZERO);
      signalsOnRampTwo[0] = ZERO;
      signalsOnRampTwo[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoThree"));

      const signalsMaliciousOnRamp = new Array<BigNumber>(45).fill(ZERO);
      signalsMaliciousOnRamp[0] = ZERO;
      signalsMaliciousOnRamp[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoTwo"));

      await ramp.connect(offRamper.wallet).register(
        _a,
        _b,
        _c,
        signalsOffRamp
      );
      await ramp.connect(onRamper.wallet).register(
        _a,
        _b,
        _c,
        signalsOnRamp
      );

      await ramp.connect(onRamperTwo.wallet).register(
        _a,
        _b,
        _c,
        signalsOnRampTwo
      );

      await ramp.connect(maliciousOnRamper.wallet).register(
        _a,
        _b,
        _c,
        signalsMaliciousOnRamp
      );

      await usdcToken.connect(offRamper.wallet).approve(ramp.address, usdc(10000));
    });

    describe("#offRamp", async () => {
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

      it("should correctly update the deposits mapping with the correct key", async () => {
        await subject();

        const conversionRate = subjectDepositAmount.mul(ether(1)).div(subjectReceiveAmount);

        const deposit = await ramp.getDeposit(ZERO);

        expect(deposit.depositor).to.eq(subjectCaller.address);
        expect(deposit.remainingDeposits).to.eq(subjectDepositAmount);
        expect(deposit.outstandingIntentAmount).to.eq(ZERO);
        expect(deposit.conversionRate).to.eq(conversionRate);
        expect(deposit.convenienceFee).to.eq(subjectConvenienceFee);
      });

      it("should increment the deposit counter correctly", async () => {
        await subject();

        const depositCounter = await ramp.depositCounter();

        expect(depositCounter).to.eq(ONE);
      });

      it("should emit a DepositReceived event", async () => {
        const conversionRate = subjectDepositAmount.mul(ether(1)).div(subjectReceiveAmount);

        await expect(subject()).to.emit(ramp, "DepositReceived").withArgs(
          ZERO,
          subjectVenmoId,
          subjectDepositAmount,
          conversionRate,
          subjectConvenienceFee
        );
      });

      describe("when the caller is not the address associated with the account", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender must be the account owner");
        });
      });

      describe("when the deposited amount is less than the minimum", async () => {
        beforeEach(async () => {
          subjectDepositAmount = usdc(19.99);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Deposit amount must be greater than min deposit amount");
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

    describe("#signalIntent", async () => {
      let subjectVenmoId: string;
      let subjectDepositId: BigNumber;
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
        subjectDepositId = ZERO;
        subjectAmount = usdc(50);
        subjectCaller = onRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).signalIntent(subjectVenmoId, subjectDepositId, subjectAmount);
      }

      it("should create the correct entry in the intents mapping", async () => {
        await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositId, currentTimestamp);

        const intent = await ramp.intents(intentHash);

        expect(intent.onramper).to.eq(subjectCaller.address);
        expect(intent.deposit).to.eq(subjectDepositId);
        expect(intent.amount).to.eq(subjectAmount);
        expect(intent.intentTimestamp).to.eq(currentTimestamp);
      });

      it("should update the deposit mapping correctly", async () => {
        const preDeposit = await ramp.getDeposit(subjectDepositId);

        await subject();

        const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositId, await blockchain.getCurrentTimestamp());

        const postDeposit = await ramp.getDeposit(subjectDepositId);

        expect(postDeposit.outstandingIntentAmount).to.eq(preDeposit.outstandingIntentAmount.add(subjectAmount));
        expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.sub(subjectAmount));
        expect(postDeposit.intentHashes).to.include(intentHash);
      });

      it("should emit an IntentSignaled event", async () => {
        const txn = await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositId, currentTimestamp);

        expect(txn).to.emit(ramp, "IntentSignaled").withArgs(
          intentHash,
          subjectDepositId,
          subjectVenmoId,
          subjectAmount,
          currentTimestamp
        );
      });

      describe("when there aren't enough deposits to cover requested amount but there are prunable intents", async () => {
        let timeJump: number;
        let oldIntentHash: string;

        before(async () => {
          timeJump = ONE_DAY_IN_SECONDS.add(1).toNumber();
        });

        beforeEach(async () => {
          await subject();

          const currentTimestamp = await blockchain.getCurrentTimestamp();
          oldIntentHash = calculateIntentHash(subjectVenmoId, subjectDepositId, currentTimestamp);

          await blockchain.increaseTimeAsync(timeJump);

          subjectVenmoId = ethers.utils.formatBytes32String("proofOfVenmoThree");
          subjectAmount = usdc(60);
          subjectCaller = onRamperTwo;
        });

        it("should prune the intent and update the rest of the deposit mapping correctly", async () => {
          const preDeposit = await ramp.getDeposit(subjectDepositId);

          expect(preDeposit.intentHashes).to.include(oldIntentHash);

          await subject();

          const newIntentHash = calculateIntentHash(subjectVenmoId, subjectDepositId, await blockchain.getCurrentTimestamp());
          const postDeposit = await ramp.getDeposit(subjectDepositId);

          expect(postDeposit.outstandingIntentAmount).to.eq(subjectAmount);
          expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.sub(usdc(10))); // 10 usdc difference between old and new intent
          expect(postDeposit.intentHashes).to.include(newIntentHash);
          expect(postDeposit.intentHashes).to.not.include(oldIntentHash);
        });

        it("should delete the original intent from the intents mapping", async () => {
          await subject();
  
          const intent = await ramp.intents(oldIntentHash);
  
          expect(intent.onramper).to.eq(ADDRESS_ZERO);
          expect(intent.deposit).to.eq(ZERO_BYTES32);
          expect(intent.amount).to.eq(ZERO);
          expect(intent.intentTimestamp).to.eq(ZERO);
        });

        it("should correctly add a new intent to the intents mapping", async () => {
          await subject();

          const currentTimestamp = await blockchain.getCurrentTimestamp();
          const intentHash = calculateIntentHash(subjectVenmoId, subjectDepositId, currentTimestamp);
  
          const intent = await ramp.intents(intentHash);
  
          expect(intent.onramper).to.eq(subjectCaller.address);
          expect(intent.deposit).to.eq(subjectDepositId);
          expect(intent.amount).to.eq(subjectAmount);
          expect(intent.intentTimestamp).to.eq(currentTimestamp);
        });

        it("should emit an IntentPruned event", async () => {
          await expect(subject()).to.emit(ramp, "IntentPruned").withArgs(oldIntentHash, subjectDepositId);
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

      describe("when the caller already has an outstanding intent", async () => {
        beforeEach(async () => {
          await subject();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent still outstanding");
        });
      });

      describe("when the caller already has an outstanding intent but is calling from a different address", async () => {
        beforeEach(async () => {
          await subject();

          subjectVenmoId = ethers.utils.formatBytes32String("proofOfVenmoTwo");
          subjectCaller = maliciousOnRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent still outstanding");
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

    describe("#onRampWithConvenience", async () => {
      let subjectA: [BigNumber, BigNumber];
      let subjectB: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
      let subjectC: [BigNumber, BigNumber];
      let subjectSignals: BigNumber[];
      let subjectCaller: Account;

      let depositHash: BigNumber;
      let intentHash: string;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(100),
          usdc(101),
          usdc(2)
        );

        const venmoId = ethers.utils.formatBytes32String("proofOfVenmoTwo");
        depositHash = ZERO;

        await ramp.connect(onRamper.wallet).signalIntent(venmoId, depositHash, usdc(50));

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        intentHash = calculateIntentHash(venmoId, depositHash, currentTimestamp);
        
        subjectSignals = new Array<BigNumber>(51).fill(ZERO);
        subjectSignals[0] = currentTimestamp;
        subjectSignals[1] = BigNumber.from(1);
        subjectSignals[2] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoTwo"));
        subjectSignals[3] = BigNumber.from(intentHash);

        subjectA = [ZERO, ZERO];
        subjectB = [[ZERO, ZERO], [ZERO, ZERO]];
        subjectC = [ZERO, ZERO];
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).onRampWithConvenience(subjectA, subjectB, subjectC, subjectSignals);
      }

      it("should transfer the usdc correctly to all parties", async () => {
        const onRamperPreBalance = await usdcToken.balanceOf(onRamper.address);
        const offRamperPreBalance = await usdcToken.balanceOf(offRamper.address);
        const rampPreBalance = await usdcToken.balanceOf(ramp.address);
        
        await subject();

        const onRamperPostBalance = await usdcToken.balanceOf(onRamper.address);
        const offRamperPostBalance = await usdcToken.balanceOf(offRamper.address);
        const rampPostBalance = await usdcToken.balanceOf(ramp.address);

        expect(onRamperPostBalance).to.eq(onRamperPreBalance.add(usdc(48)));
        expect(offRamperPostBalance).to.eq(offRamperPreBalance.add(usdc(2)));
        expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(50)));
      });

      it("should delete the intent from the intents mapping", async () => {
        await subject();

        const intent = await ramp.intents(intentHash);

        expect(intent.onramper).to.eq(ADDRESS_ZERO);
        expect(intent.deposit).to.eq(ZERO_BYTES32);
        expect(intent.amount).to.eq(ZERO);
        expect(intent.intentTimestamp).to.eq(ZERO);
      });

      it("should correctly update state in the deposit mapping", async () => {
        const preDeposit = await ramp.getDeposit(depositHash);

        await subject();

        const postDeposit = await ramp.getDeposit(depositHash);

        expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits);
        expect(postDeposit.outstandingIntentAmount).to.eq(preDeposit.outstandingIntentAmount.sub(usdc(50)));
        expect(postDeposit.intentHashes).to.not.include(intentHash);
      });

      it("should emit an IntentFulfilled event", async () => {
        await expect(subject()).to.emit(ramp, "IntentFulfilled").withArgs(
          intentHash,
          depositHash,
          onRamper.address,
          usdc(50),
          usdc(2)
        );
      });

      describe("when the proof wasn't submitted in time to get the convenience reward", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(30);
        });

        it("should transfer the usdc correctly to all parties", async () => {
          const onRamperPreBalance = await usdcToken.balanceOf(onRamper.address);
          const offRamperPreBalance = await usdcToken.balanceOf(offRamper.address);
          const rampPreBalance = await usdcToken.balanceOf(ramp.address);
          
          await subject();
  
          const onRamperPostBalance = await usdcToken.balanceOf(onRamper.address);
          const offRamperPostBalance = await usdcToken.balanceOf(offRamper.address);
          const rampPostBalance = await usdcToken.balanceOf(ramp.address);
  
          expect(onRamperPostBalance).to.eq(onRamperPreBalance.add(usdc(50)));
          expect(offRamperPostBalance).to.eq(offRamperPreBalance.add(usdc(0)));
          expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(50)));
        });
  
        it("should emit an IntentFulfilled event", async () => {
          await expect(subject()).to.emit(ramp, "IntentFulfilled").withArgs(
            intentHash,
            depositHash,
            onRamper.address,
            usdc(50),
            0
          );
        });
      });

      describe("when the onRamperIdHash doesn't match the intent", async () => {
        beforeEach(async () => {
          subjectSignals[2] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmo"));
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Onramper id does not match");
        });
      });

      describe("when the caller is not the offRamper", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender must be the account owner");
        });
      });
    });

    describe("#onRamp", async () => {
      let subjectA: [BigNumber, BigNumber];
      let subjectB: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
      let subjectC: [BigNumber, BigNumber];
      let subjectSignals: BigNumber[];
      let subjectCaller: Account;

      let intentHash: string;
      let depositId: BigNumber;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(100),
          usdc(101),
          usdc(2)
        );
        
        depositId = (await ramp.depositCounter()).sub(1);

        const venmoId = ethers.utils.formatBytes32String("proofOfVenmoTwo");
        await ramp.connect(onRamper.wallet).signalIntent(venmoId, depositId, usdc(50));

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        intentHash = calculateIntentHash(venmoId, depositId, currentTimestamp);

        subjectSignals = new Array<BigNumber>(51).fill(ZERO);
        subjectSignals[0] = usdc(50);
        subjectSignals[1] = BigNumber.from(1);
        subjectSignals[2] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmo"));
        subjectSignals[3] = BigNumber.from(intentHash);

        subjectA = [ZERO, ZERO];
        subjectB = [[ZERO, ZERO], [ZERO, ZERO]];
        subjectC = [ZERO, ZERO];
        subjectCaller = onRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).onRamp(subjectA, subjectB, subjectC, subjectSignals);
      }

      it("should transfer the usdc correctly to all parties", async () => {
        const onRamperPreBalance = await usdcToken.balanceOf(onRamper.address);
        const rampPreBalance = await usdcToken.balanceOf(ramp.address);
        
        await subject();

        const onRamperPostBalance = await usdcToken.balanceOf(onRamper.address);
        const rampPostBalance = await usdcToken.balanceOf(ramp.address);

        expect(onRamperPostBalance).to.eq(onRamperPreBalance.add(usdc(50)));
        expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(50)));
      });

      it("should delete the intent from the intents mapping", async () => {
        await subject();

        const intent = await ramp.intents(intentHash);

        expect(intent.onramper).to.eq(ADDRESS_ZERO);
        expect(intent.deposit).to.eq(ZERO_BYTES32);
        expect(intent.amount).to.eq(ZERO);
        expect(intent.intentTimestamp).to.eq(ZERO);
      });

      it("should correctly update state in the deposit mapping", async () => {
        const preDeposit = await ramp.getDeposit(depositId);

        await subject();

        const postDeposit = await ramp.getDeposit(depositId);

        expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits);
        expect(postDeposit.outstandingIntentAmount).to.eq(preDeposit.outstandingIntentAmount.sub(usdc(50)));
        expect(postDeposit.intentHashes).to.not.include(intentHash);
      });

      it("should emit an IntentFulfilled event", async () => {
        await expect(subject()).to.emit(ramp, "IntentFulfilled").withArgs(
          intentHash,
          depositId,
          onRamper.address,
          usdc(50),
          ZERO
        );
      });

      describe("when the amount paid was not enough", async () => {
        beforeEach(async () => {
          subjectSignals[0] = usdc(49.99);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Payment was not enough");
        });
      });

      describe("when the offRamperIdHash doesn't match the intent", async () => {
        beforeEach(async () => {
          subjectSignals[2] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoTwo"));
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Offramper id does not match");
        });
      });
    });

    describe("#withdrawDeposit", async () => {
      let subjectDepositIds: BigNumber[];
      let subjectCaller: Account;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(100),
          usdc(101),
          usdc(2)
        );

        await ramp.connect(offRamper.wallet).offRamp(
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(50),
          usdc(51),
          usdc(2)
        );
        
        const currentDepositCounter = await ramp.depositCounter();
        const depositIdOne = BigNumber.from(currentDepositCounter.sub(2));
        const depositIdTwo = BigNumber.from(currentDepositCounter.sub(1));

        subjectDepositIds = [depositIdOne, depositIdTwo];
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).withdrawDeposit(subjectDepositIds);
      }

      it("should transfer the usdc to the caller", async () => {
        const offRamperPreBalance = await usdcToken.balanceOf(offRamper.address);
        const rampPreBalance = await usdcToken.balanceOf(ramp.address);
        
        await subject();

        const offRamperPostBalance = await usdcToken.balanceOf(offRamper.address);
        const rampPostBalance = await usdcToken.balanceOf(ramp.address);

        expect(offRamperPostBalance).to.eq(offRamperPreBalance.add(usdc(150)));
        expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(150)));
      });

      it("should delete the deposits", async () => {
        const preDepositOne = await ramp.getDeposit(subjectDepositIds[0]);
        const preDepositTwo = await ramp.getDeposit(subjectDepositIds[1]);

        expect(preDepositOne.depositor).to.not.eq(ADDRESS_ZERO);
        expect(preDepositTwo.depositor).to.not.eq(ADDRESS_ZERO);

        await subject();

        const depositOne = await ramp.getDeposit(subjectDepositIds[0]);
        const depositTwo = await ramp.getDeposit(subjectDepositIds[1]);

        expect(depositOne.depositor).to.eq(ADDRESS_ZERO);
        expect(depositTwo.depositor).to.eq(ADDRESS_ZERO);
      });

      it("should emit a DepositWithdrawn event", async () => {
        const tx = await subject();
        
        expect(tx).to.emit(ramp, "DepositWithdrawn").withArgs(
          subjectDepositIds[0],
          offRamper.address,
          usdc(100),
        );
        expect(tx).to.emit(ramp, "DepositWithdrawn").withArgs(
          subjectDepositIds[1],
          offRamper.address,
          usdc(50),
        );
      });

      describe("when there is an outstanding intent", async () => {
        beforeEach(async () => {
          await ramp.connect(onRamper.wallet).signalIntent(
            ethers.utils.formatBytes32String("proofOfVenmoTwo"),
            subjectDepositIds[0],
            usdc(50)
          );
        });

        it("should transfer the correct amount of usdc to the caller", async () => {
          const offRamperPreBalance = await usdcToken.balanceOf(offRamper.address);
          const rampPreBalance = await usdcToken.balanceOf(ramp.address);
          
          await subject();
  
          const offRamperPostBalance = await usdcToken.balanceOf(offRamper.address);
          const rampPostBalance = await usdcToken.balanceOf(ramp.address);
  
          expect(offRamperPostBalance).to.eq(offRamperPreBalance.add(usdc(100)));
          expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(100)));
        });

        it("should zero out remainingDeposits on depositOne", async () => {
          await subject();
  
          const depositOne = await ramp.getDeposit(subjectDepositIds[0]);
  
          expect(depositOne.depositor).to.not.eq(ZERO_BYTES32);
          expect(depositOne.intentHashes.length).to.eq(1);
          expect(depositOne.remainingDeposits).to.eq(ZERO);
          expect(depositOne.outstandingIntentAmount).to.eq(usdc(50));
        });

        it("should delete deposit two", async () => {
          await subject();
  
          const depositTwo = await ramp.getDeposit(subjectDepositIds[1]);
  
          expect(depositTwo.depositor).to.eq(ADDRESS_ZERO);
        });

        describe("but the intent is expired", async () => {
          beforeEach(async () => {
            await blockchain.increaseTimeAsync(ONE_DAY_IN_SECONDS.add(1).toNumber());
          });

          it("should transfer the correct amount of usdc to the caller", async () => {
            const offRamperPreBalance = await usdcToken.balanceOf(offRamper.address);
            const rampPreBalance = await usdcToken.balanceOf(ramp.address);
            
            await subject();
    
            const offRamperPostBalance = await usdcToken.balanceOf(offRamper.address);
            const rampPostBalance = await usdcToken.balanceOf(ramp.address);
    
            expect(offRamperPostBalance).to.eq(offRamperPreBalance.add(usdc(150)));
            expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(150)));
          });

          it("should delete both deposits", async () => {
            await subject();
    
            const depositOne = await ramp.getDeposit(subjectDepositIds[0]);
            const depositTwo = await ramp.getDeposit(subjectDepositIds[1]);
    
            expect(depositOne.depositor).to.eq(ADDRESS_ZERO);
            expect(depositTwo.depositor).to.eq(ADDRESS_ZERO);
          });

          it("should delete the intent", async () => {
            const intentHash = (await ramp.getDeposit(subjectDepositIds[0])).intentHashes[0];

            const preIntent = await ramp.intents(intentHash);
            expect(preIntent.amount).to.eq(usdc(50));

            await subject();
    
            const postIntent = await ramp.intents(intentHash);
    
            expect(postIntent.onramper).to.eq(ADDRESS_ZERO);
            expect(postIntent.deposit).to.eq(ZERO_BYTES32);
            expect(postIntent.amount).to.eq(ZERO);
            expect(postIntent.intentTimestamp).to.eq(ZERO);
          });
        });
      });

      describe("when the caller is not the offRamper", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender must be the depositor");
        });
      });
    });
  });
});
