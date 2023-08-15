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
import { ZERO, ZERO_BYTES32, ADDRESS_ZERO } from "@utils/constants";
import { calculateDepositHash, calculateIntentHash } from "@utils/protocolUtils";
import { ONE_DAY_IN_SECONDS } from "@utils/constants";

const expect = getWaffleExpect();

const blockchain = new Blockchain(ethers.provider);

describe("Ramp", () => {
  let owner: Account;
  let offRamper: Account;
  let onRamper: Account;

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
      sendProcessor.address
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

      const offRamperAddress = await ramp.accountIds(ethers.utils.formatBytes32String("proofOfVenmoTwo"));
      expect(offRamperAddress).to.eq(subjectCaller.address);
    });

    it("should emit an AccountRegistered event", async () => {
      await expect(subject()).to.emit(ramp, "AccountRegistered").withArgs(ethers.utils.formatBytes32String("proofOfVenmoTwo"), subjectCaller.address);
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
      const _a: [BigNumber, BigNumber] = [ZERO, ZERO];
      const _b: [[BigNumber, BigNumber], [BigNumber, BigNumber]] = [[ZERO, ZERO], [ZERO, ZERO]];
      const _c: [BigNumber, BigNumber] = [ZERO, ZERO];

      const signalsOffRamp = new Array<BigNumber>(45).fill(ZERO);
      signalsOffRamp[0] = ZERO;
      signalsOffRamp[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmo"));

      const signalsOnRamp = new Array<BigNumber>(45).fill(ZERO);
      signalsOnRamp[0] = ZERO;
      signalsOnRamp[1] = BigNumber.from(ethers.utils.formatBytes32String("proofOfVenmoTwo"));

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

      describe("when the deposit hash already exists and no intents have been submitted", async () => {
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

      describe("when the deposit hash already exists but no deposits remain and there's an outstanding intent", async () => {
        beforeEach(async () => {
          await subject();

          const conversionRate = subjectDepositAmount.mul(ether(1)).div(subjectReceiveAmount);
          const depositHash = calculateDepositHash(subjectVenmoId, conversionRate, subjectConvenienceFee);
          await ramp.connect(onRamper.wallet).signalIntent(
            ethers.utils.formatBytes32String("proofOfVenmoTwo"),
            depositHash,
            subjectDepositAmount
          );
        });

        it("should update the remainingDeposits param", async () => {
          await subject();

          const conversionRate = subjectDepositAmount.mul(ether(1)).div(subjectReceiveAmount);
          const depositHash = calculateDepositHash(subjectVenmoId, conversionRate, subjectConvenienceFee);

          const deposit = await ramp.getDeposit(depositHash);

          expect(deposit.remainingDeposits).to.eq(subjectDepositAmount);
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

    describe("#signalIntent", async () => {
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

      describe("when the intent has already been submitted", async () => {
        beforeEach(async () => {
          await subject();
          const lastTimestamp = await time.latest();

          await time.setNextBlockTimestamp(lastTimestamp);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent already exists");
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

      let depositHash: string;
      let intentHash: string;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(100),
          usdc(101),
          usdc(2)
        );

        const conversionRate = usdc(100).mul(ether(1)).div(usdc(101));

        const venmoId = ethers.utils.formatBytes32String("proofOfVenmoTwo");
        depositHash = calculateDepositHash(ethers.utils.formatBytes32String("proofOfVenmo"), conversionRate, usdc(2));

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

        expect(intent.onramper).to.eq(ZERO_BYTES32);
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
          ethers.utils.formatBytes32String("proofOfVenmoTwo"),
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
            ethers.utils.formatBytes32String("proofOfVenmoTwo"),
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
      let depositHash: string;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(100),
          usdc(101),
          usdc(2)
        );

        const conversionRate = usdc(100).mul(ether(1)).div(usdc(101));

        const venmoId = ethers.utils.formatBytes32String("proofOfVenmoTwo");
        depositHash = calculateDepositHash(ethers.utils.formatBytes32String("proofOfVenmo"), conversionRate, usdc(2));

        await ramp.connect(onRamper.wallet).signalIntent(venmoId, depositHash, usdc(50));

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        intentHash = calculateIntentHash(venmoId, depositHash, currentTimestamp);

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

        expect(intent.onramper).to.eq(ZERO_BYTES32);
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
          ethers.utils.formatBytes32String("proofOfVenmoTwo"),
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
      let subjectDepositHashes: string[];
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

        const conversionRateOne = usdc(100).mul(ether(1)).div(usdc(101));
        const conversionRateTwo = usdc(50).mul(ether(1)).div(usdc(51));

        const depositHashOne = calculateDepositHash(ethers.utils.formatBytes32String("proofOfVenmo"), conversionRateOne, usdc(2));
        const depositHashTwo = calculateDepositHash(ethers.utils.formatBytes32String("proofOfVenmo"), conversionRateTwo, usdc(2));

        subjectDepositHashes = [depositHashOne, depositHashTwo];
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).withdrawDeposit(subjectDepositHashes);
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
        await subject();

        const depositOne = await ramp.getDeposit(subjectDepositHashes[0]);
        const depositTwo = await ramp.getDeposit(subjectDepositHashes[1]);

        expect(depositOne.depositor).to.eq(ZERO_BYTES32);
        expect(depositTwo.depositor).to.eq(ZERO_BYTES32);
      });

      it("should emit a DepositWithdrawn event", async () => {
        const tx = await subject();
        
        expect(tx).to.emit(ramp, "DepositWithdrawn").withArgs(
          subjectDepositHashes[0],
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(100),
        );
        expect(tx).to.emit(ramp, "DepositWithdrawn").withArgs(
          subjectDepositHashes[1],
          ethers.utils.formatBytes32String("proofOfVenmo"),
          usdc(50),
        );
      });

      describe("when there is an outstanding intent", async () => {
        beforeEach(async () => {
          await ramp.connect(onRamper.wallet).signalIntent(
            ethers.utils.formatBytes32String("proofOfVenmoTwo"),
            subjectDepositHashes[0],
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
  
          const depositOne = await ramp.getDeposit(subjectDepositHashes[0]);
  
          expect(depositOne.depositor).to.not.eq(ZERO_BYTES32);
          expect(depositOne.intentHashes.length).to.eq(1);
          expect(depositOne.remainingDeposits).to.eq(ZERO);
          expect(depositOne.outstandingIntentAmount).to.eq(usdc(50));
        });

        it("should delete deposit two", async () => {
          await subject();
  
          const depositTwo = await ramp.getDeposit(subjectDepositHashes[1]);
  
          expect(depositTwo.depositor).to.eq(ZERO_BYTES32);
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
    
            const depositOne = await ramp.getDeposit(subjectDepositHashes[0]);
            const depositTwo = await ramp.getDeposit(subjectDepositHashes[1]);
    
            expect(depositOne.depositor).to.eq(ZERO_BYTES32);
            expect(depositTwo.depositor).to.eq(ZERO_BYTES32);
          });

          it("should delete the intent", async () => {
            const intentHash = (await ramp.getDeposit(subjectDepositHashes[0])).intentHashes[0];

            const preIntent = await ramp.intents(intentHash);
            expect(preIntent.amount).to.eq(usdc(50));

            await subject();
    
            const postIntent = await ramp.intents(intentHash);
    
            expect(postIntent.onramper).to.eq(ZERO_BYTES32);
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
          await expect(subject()).to.be.revertedWith("Sender must be the account owner");
        });
      });
    });

    describe("#setAccountOwner", async () => {
      let subjectVenmoId: string;
      let subjectNewOwner: Address;
      let subjectCaller: Account;
  
      beforeEach(async () => {
        subjectVenmoId = ethers.utils.formatBytes32String("proofOfVenmo");
        subjectNewOwner = owner.address;;
        subjectCaller = offRamper;
      });
  
      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setAccountOwner(subjectVenmoId, subjectNewOwner);
      }
  
      it("should update the owner", async () => {
        await subject();
  
        const newOwnerAddress = await ramp.accountIds(subjectVenmoId);
        expect(newOwnerAddress).to.eq(subjectNewOwner);
      });
  
      it("should emit an AccountOwnerUpdated event", async () => {
        await expect(subject()).to.emit(ramp, "AccountOwnerUpdated").withArgs(subjectVenmoId, subjectNewOwner);
      });
  
      describe("when the new owner is the zero address", async () => {
        beforeEach(async () => {
          subjectNewOwner = ADDRESS_ZERO;
        });
  
        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("New owner cannot be zero address");
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
    });
  });
});
