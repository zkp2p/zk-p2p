import "module-alias/register";

import { ethers } from "hardhat";

import {
  Address,
} from "@utils/types";
import { Account } from "@utils/test/types";
import {
  Ramp,
  USDCMock,
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
import { calculateIntentHash, calculatePackedVenmoId, calculateVenmoIdHash } from "@utils/protocolUtils";
import { ONE_DAY_IN_SECONDS } from "@utils/constants";

const expect = getWaffleExpect();

const blockchain = new Blockchain(ethers.provider);

describe("Ramp", () => {
  let owner: Account;
  let offRamper: Account;
  let offRamperNewAcct: Account;
  let onRamper: Account;
  let onRamperTwo: Account;
  let receiver: Account;
  let maliciousOnRamper: Account;
  let unregisteredUser: Account;
  let feeRecipient: Account;

  let ramp: Ramp;
  let usdcToken: USDCMock;
  let registrationProcessor: VenmoRegistrationProcessorMock;
  let sendProcessor: VenmoSendProcessorMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      offRamper,
      onRamper,
      onRamperTwo,
      receiver,
      maliciousOnRamper,
      unregisteredUser,
      offRamperNewAcct,
      feeRecipient
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    const poseidonContract = await deployer.deployPoseidon();

    usdcToken = await deployer.deployUSDCMock(usdc(1000000000), "USDC", "USDC");
    registrationProcessor = await deployer.deployVenmoRegistrationProcessorMock();
    sendProcessor = await deployer.deployVenmoSendProcessorMock();

    await usdcToken.transfer(offRamper.address, usdc(10000));

    ramp = await deployer.deployRamp(
      owner.address,
      usdcToken.address,
      poseidonContract.address,
      usdc(20),                          // $20 min deposit amount
      usdc(999),
      ONE_DAY_IN_SECONDS,
      ONE_DAY_IN_SECONDS,               // On ramp cooldown period
      ZERO,                             // Sustainability fee
      feeRecipient.address
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

    it("should set the correct min deposit amount", async () => {
      const minDepositAmount: BigNumber = await ramp.minDepositAmount();
      expect(minDepositAmount).to.eq(usdc(20));
    });

    it("should set the correct max on ramp amount", async () => {
      const maxOnRampAmount: BigNumber = await ramp.maxOnRampAmount();
      expect(maxOnRampAmount).to.eq(usdc(999));
    });

    it("should have the correct owner set", async () => {
      const keyHash = await ramp.owner();
      expect(keyHash).to.eq(owner.address);
    });
  });

  describe("#initialize", async () => {
    let subjectRegistrationProcessor: Address;
    let subjectSendProcessor: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectRegistrationProcessor = registrationProcessor.address;
      subjectSendProcessor = sendProcessor.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return ramp.connect(subjectCaller.wallet).initialize(
        subjectRegistrationProcessor,
        subjectSendProcessor
      );
    }

    it("should set the correct processor addresses", async () => {
      await subject();

      const registrationProcessorAddress: Address = await ramp.registrationProcessor();
      const sendProcessorAddress: Address = await ramp.sendProcessor();

      expect(registrationProcessorAddress).to.eq(registrationProcessor.address);
      expect(sendProcessorAddress).to.eq(sendProcessor.address);
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
        subjectCaller = onRamper;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#register", async () => {
    let subjectA: [BigNumber, BigNumber];
    let subjectB: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
    let subjectC: [BigNumber, BigNumber];
    let subjectSignals: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber];
    let subjectCaller: Account;

    beforeEach(async () => {
      await ramp.initialize(registrationProcessor.address, sendProcessor.address);

      subjectSignals = [ZERO, ZERO, ZERO, ZERO, ZERO];
      subjectSignals[0] = BigNumber.from(1);
      subjectSignals[1] = BigNumber.from(await calculateVenmoIdHash("1"));

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

      const offRamperVenmoIdHash = (await ramp.getAccountInfo(subjectCaller.address)).venmoIdHash;
      expect(offRamperVenmoIdHash).to.eq(subjectSignals[1]);
    });

    it("should emit an AccountRegistered event", async () => {
      await expect(subject()).to.emit(ramp, "AccountRegistered").withArgs(
        subjectCaller.address,
        subjectSignals[1]
      );
    });

    describe("when the caller is already registered", async () => {
      beforeEach(async () => {
        await subject();

        subjectSignals[1] = BigNumber.from(await calculateVenmoIdHash("3"));
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Account already associated with venmoId");
      });
    });
  });

  context("when the on and off ramper are registered", async () => {
    let signalsOffRamp: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber];
    let signalsOnRamp: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber];
    let signalsOnRampTwo: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber];
    let signalsMaliciousOnRamp: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber];

    beforeEach(async () => {
      await ramp.initialize(registrationProcessor.address, sendProcessor.address);

      const _a: [BigNumber, BigNumber] = [ZERO, ZERO];
      const _b: [[BigNumber, BigNumber], [BigNumber, BigNumber]] = [[ZERO, ZERO], [ZERO, ZERO]];
      const _c: [BigNumber, BigNumber] = [ZERO, ZERO];

      signalsOffRamp = [ZERO, BigNumber.from(await calculateVenmoIdHash("1")), ZERO, ZERO, ZERO];
      signalsOnRamp = [ZERO, BigNumber.from(await calculateVenmoIdHash("2")), ZERO, ZERO, ZERO];
      signalsOnRampTwo = [ZERO, BigNumber.from(await calculateVenmoIdHash("3")), ZERO, ZERO, ZERO];
      signalsMaliciousOnRamp = [ZERO, BigNumber.from(await calculateVenmoIdHash("2")), ZERO, ZERO, ZERO];

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
      let subjectPackedVenmoId: [BigNumber, BigNumber, BigNumber];
      let subjectDepositAmount: BigNumber;
      let subjectReceiveAmount: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectPackedVenmoId = calculatePackedVenmoId("1");
        subjectDepositAmount = usdc(100);
        subjectReceiveAmount = usdc(101);
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).offRamp(subjectPackedVenmoId, subjectDepositAmount, subjectReceiveAmount);
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
        expect(JSON.stringify(deposit.packedVenmoId)).to.eq(JSON.stringify(subjectPackedVenmoId));
        expect(deposit.depositAmount).to.eq(subjectDepositAmount);
        expect(deposit.remainingDeposits).to.eq(subjectDepositAmount);
        expect(deposit.outstandingIntentAmount).to.eq(ZERO);
        expect(deposit.conversionRate).to.eq(conversionRate);
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
          await calculateVenmoIdHash("1"),
          subjectDepositAmount,
          conversionRate
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

      describe("when the depositor has reached their max amount of deposits", async () => {
        beforeEach(async () => {
          await ramp.connect(subjectCaller.wallet).offRamp(subjectPackedVenmoId, subjectDepositAmount, usdc(102));
          await ramp.connect(subjectCaller.wallet).offRamp(subjectPackedVenmoId, subjectDepositAmount, usdc(103));
          await ramp.connect(subjectCaller.wallet).offRamp(subjectPackedVenmoId, subjectDepositAmount, usdc(104));
          await ramp.connect(subjectCaller.wallet).offRamp(subjectPackedVenmoId, subjectDepositAmount, usdc(105));
          await ramp.connect(subjectCaller.wallet).offRamp(subjectPackedVenmoId, subjectDepositAmount, usdc(106));
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Maximum deposit amount reached");
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
      let subjectDepositId: BigNumber;
      let subjectAmount: BigNumber;
      let subjectTo: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          await calculatePackedVenmoId("1"),
          usdc(100),
          usdc(101)
        );

        subjectDepositId = ZERO;
        subjectAmount = usdc(50);
        subjectTo = receiver.address;
        subjectCaller = onRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).signalIntent(subjectDepositId, subjectAmount, subjectTo);
      }

      it("should create the correct entry in the intents mapping", async () => {
        await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const intentHash = calculateIntentHash(await calculateVenmoIdHash("2"), subjectDepositId, currentTimestamp);

        const intent = await ramp.intents(intentHash);

        expect(intent.onRamper).to.eq(subjectCaller.address);
        expect(intent.to).to.eq(subjectTo);
        expect(intent.deposit).to.eq(subjectDepositId);
        expect(intent.amount).to.eq(subjectAmount);
        expect(intent.intentTimestamp).to.eq(currentTimestamp);
      });

      it("should update the deposit mapping correctly", async () => {
        const preDeposit = await ramp.getDeposit(subjectDepositId);

        await subject();

        const intentHash = calculateIntentHash(await calculateVenmoIdHash("2"), subjectDepositId, await blockchain.getCurrentTimestamp());

        const postDeposit = await ramp.getDeposit(subjectDepositId);

        expect(postDeposit.outstandingIntentAmount).to.eq(preDeposit.outstandingIntentAmount.add(subjectAmount));
        expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.sub(subjectAmount));
        expect(postDeposit.intentHashes).to.include(intentHash);
      });

      it("should update the venmoIdIntent mapping correctly", async () => {
        await subject();

        const expectedIntentHash = calculateIntentHash(
          await calculateVenmoIdHash("2"),
          subjectDepositId,
          await blockchain.getCurrentTimestamp()
        );

        const intentHash = await ramp.getVenmoIdCurrentIntentHash(subjectCaller.address);

        expect(expectedIntentHash).to.eq(intentHash);
      });

      it("should emit an IntentSignaled event", async () => {
        const txn = await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const intentHash = calculateIntentHash(await calculateVenmoIdHash("2"), subjectDepositId, currentTimestamp);

        expect(txn).to.emit(ramp, "IntentSignaled").withArgs(
          intentHash,
          subjectDepositId,
          await calculateVenmoIdHash("2"),
          subjectTo,
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
          oldIntentHash = calculateIntentHash(await calculateVenmoIdHash("2"), subjectDepositId, currentTimestamp);

          await blockchain.increaseTimeAsync(timeJump);

          subjectAmount = usdc(60);
          subjectCaller = onRamperTwo;
        });

        it("should prune the intent and update the rest of the deposit mapping correctly", async () => {
          const preDeposit = await ramp.getDeposit(subjectDepositId);

          expect(preDeposit.intentHashes).to.include(oldIntentHash);

          await subject();

          const newIntentHash = calculateIntentHash(await calculateVenmoIdHash("3"), subjectDepositId, await blockchain.getCurrentTimestamp());
          const postDeposit = await ramp.getDeposit(subjectDepositId);

          expect(postDeposit.outstandingIntentAmount).to.eq(subjectAmount);
          expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.sub(usdc(10))); // 10 usdc difference between old and new intent
          expect(postDeposit.intentHashes).to.include(newIntentHash);
          expect(postDeposit.intentHashes).to.not.include(oldIntentHash);
        });

        it("should delete the original intent from the intents mapping", async () => {
          await subject();

          const intent = await ramp.intents(oldIntentHash);

          expect(intent.onRamper).to.eq(ADDRESS_ZERO);
          expect(intent.deposit).to.eq(ZERO_BYTES32);
          expect(intent.amount).to.eq(ZERO);
          expect(intent.intentTimestamp).to.eq(ZERO);
        });

        it("should correctly add a new intent to the intents mapping", async () => {
          await subject();

          const currentTimestamp = await blockchain.getCurrentTimestamp();
          const intentHash = calculateIntentHash(await calculateVenmoIdHash("3"), subjectDepositId, currentTimestamp);

          const intent = await ramp.intents(intentHash);

          expect(intent.onRamper).to.eq(subjectCaller.address);
          expect(intent.deposit).to.eq(subjectDepositId);
          expect(intent.amount).to.eq(subjectAmount);
          expect(intent.intentTimestamp).to.eq(currentTimestamp);
        });

        it("should update the venmoIdIntent mapping correctly", async () => {
          await subject();

          const expectedIntentHash = calculateIntentHash(
            await calculateVenmoIdHash("3"),
            subjectDepositId,
            await blockchain.getCurrentTimestamp()
          );

          const intentHash = await ramp.getVenmoIdCurrentIntentHash(subjectCaller.address);

          expect(expectedIntentHash).to.eq(intentHash);
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

      describe("when the caller is on the depositor's denylist", async () => {
        beforeEach(async () => {
          await ramp.connect(offRamper.wallet).addAccountToDenylist(calculateVenmoIdHash("2"));
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Onramper on depositor's denylist");
        });
      });

      describe("when the caller is the depositor", async () => {
        beforeEach(async () => {
          subjectCaller = offRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender cannot be the depositor");
        });
      });

      describe("when the caller is the depositor from another Ethereum account", async () => {
        beforeEach(async () => {
          const _a: [BigNumber, BigNumber] = [ZERO, ZERO];
          const _b: [[BigNumber, BigNumber], [BigNumber, BigNumber]] = [[ZERO, ZERO], [ZERO, ZERO]];
          const _c: [BigNumber, BigNumber] = [ZERO, ZERO];

          await ramp.connect(offRamperNewAcct.wallet).register(
            _a,
            _b,
            _c,
            signalsOffRamp
          );

          subjectCaller = offRamperNewAcct;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender cannot be the depositor");
        });
      });

      describe("when the to address is zero", async () => {
        beforeEach(async () => {
          subjectTo = ADDRESS_ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Cannot send to zero address");
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

      describe("when the amount is zero", async () => {
        beforeEach(async () => {
          subjectAmount = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Signaled amount must be greater than 0");
        });
      });

      describe("when the amount exceeds the max on ramp amount", async () => {
        beforeEach(async () => {
          subjectAmount = usdc(1000);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Signaled amount must be less than max on-ramp amount");
        });
      });

      describe("when the cool down period hasn't elapsed", async () => {
        beforeEach(async () => {
          await subject();

          const currentTimestamp = await blockchain.getCurrentTimestamp();
          const intentHash = calculateIntentHash(await calculateVenmoIdHash("2"), subjectDepositId, currentTimestamp);
  
          const signals = new Array<BigNumber>(12).fill(ZERO);
          signals[0] = usdc(50).mul(usdc(101)).div(usdc(100));
          signals[1] = currentTimestamp;
          signals[2] = BigNumber.from(await calculateVenmoIdHash("1"));
          signals[3] = BigNumber.from(await calculateVenmoIdHash("2"));
          signals[4] = BigNumber.from(intentHash);
  
          const a: [BigNumber, BigNumber] = [ZERO, ZERO];
          const b: [[BigNumber, BigNumber],[BigNumber, BigNumber]] = [[ZERO, ZERO], [ZERO, ZERO]];
          const c: [BigNumber, BigNumber] = [ZERO, ZERO];
          
          await ramp.connect(onRamper.wallet).onRamp(a, b, c, signals);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("On ramp cool down period not elapsed");
        });
      });

      describe("when the deposit does not exist", async () => {
        beforeEach(async () => {
          subjectDepositId = BigNumber.from(10);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Deposit does not exist");
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

          subjectCaller = maliciousOnRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent still outstanding");
        });
      });
    });

    describe("#cancelIntent", async () => {
      let subjectIntentHash: string;
      let subjectCaller: Account;

      let depositId: BigNumber;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          await calculatePackedVenmoId("1"),
          usdc(100),
          usdc(101)
        );

        const venmoId = await calculateVenmoIdHash("2");
        depositId = ZERO;

        await ramp.connect(onRamper.wallet).signalIntent(depositId, usdc(50), receiver.address);

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        subjectIntentHash = calculateIntentHash(venmoId, depositId, currentTimestamp);

        subjectCaller = onRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).cancelIntent(subjectIntentHash);
      }

      it("should prune the intent and update the rest of the deposit mapping correctly", async () => {
        const preDeposit = await ramp.getDeposit(depositId);

        expect(preDeposit.intentHashes).to.include(subjectIntentHash);

        await subject();

        const postDeposit = await ramp.getDeposit(depositId);

        expect(postDeposit.outstandingIntentAmount).to.eq(preDeposit.outstandingIntentAmount.sub(usdc(50)));
        expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.add(usdc(50))); // 10 usdc difference between old and new intent
        expect(postDeposit.intentHashes).to.not.include(subjectIntentHash);
      });

      it("should delete the original intent from the intents mapping", async () => {
        await subject();

        const intent = await ramp.intents(subjectIntentHash);

        expect(intent.onRamper).to.eq(ADDRESS_ZERO);
        expect(intent.deposit).to.eq(ZERO_BYTES32);
        expect(intent.amount).to.eq(ZERO);
        expect(intent.intentTimestamp).to.eq(ZERO);
      });

      it("should update the venmoIdIntent mapping correctly", async () => {
        await subject();

        const intentHash = await ramp.getVenmoIdCurrentIntentHash(subjectCaller.address);

        expect(intentHash).to.eq(ZERO_BYTES32);
      });

      it("should emit an IntentPruned event", async () => {
        await expect(subject()).to.emit(ramp, "IntentPruned").withArgs(subjectIntentHash, depositId);
      });

      describe("when the intentHash does not exist", async () => {
        beforeEach(async () => {
          subjectIntentHash = ZERO_BYTES32;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent does not exist");
        });
      });

      describe("when the caller did not originate the intent", async () => {
        beforeEach(async () => {
          subjectCaller = offRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Sender must be the on-ramper");
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
          await calculatePackedVenmoId("1"),
          usdc(100),
          usdc(101)
        );

        depositId = (await ramp.depositCounter()).sub(1);

        const venmoId = await calculateVenmoIdHash("2");
        await ramp.connect(onRamper.wallet).signalIntent(depositId, usdc(50), receiver.address);

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        intentHash = calculateIntentHash(venmoId, depositId, currentTimestamp);

        subjectSignals = new Array<BigNumber>(12).fill(ZERO);
        subjectSignals[0] = usdc(50).mul(usdc(101)).div(usdc(100));
        subjectSignals[1] = currentTimestamp;
        subjectSignals[2] = BigNumber.from(await calculateVenmoIdHash("1"));
        subjectSignals[3] = BigNumber.from(await calculateVenmoIdHash("2"));
        subjectSignals[4] = BigNumber.from(intentHash);

        subjectA = [ZERO, ZERO];
        subjectB = [[ZERO, ZERO], [ZERO, ZERO]];
        subjectC = [ZERO, ZERO];
        subjectCaller = onRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).onRamp(subjectA, subjectB, subjectC, subjectSignals);
      }

      it("should transfer the usdc correctly to all parties", async () => {
        const receiverPreBalance = await usdcToken.balanceOf(receiver.address);
        const rampPreBalance = await usdcToken.balanceOf(ramp.address);

        await subject();

        const receiverPostBalance = await usdcToken.balanceOf(receiver.address);
        const rampPostBalance = await usdcToken.balanceOf(ramp.address);

        expect(receiverPostBalance).to.eq(receiverPreBalance.add(usdc(50)));
        expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(50)));
      });

      it("should delete the intent from the intents mapping", async () => {
        await subject();

        const intent = await ramp.intents(intentHash);

        expect(intent.onRamper).to.eq(ADDRESS_ZERO);
        expect(intent.to).to.eq(ADDRESS_ZERO);
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

      it("should log the block timestamp for user's lastOnrampTimestamp", async () => {
        await subject();
        
        const expectedLastOnRampTimestamp = await blockchain.getCurrentTimestamp();
        const lastOnRampTimestamp = await ramp.getLastOnRampTimestamp(subjectCaller.address);

        expect(lastOnRampTimestamp).to.eq(expectedLastOnRampTimestamp);
      });

      it("should emit an IntentFulfilled event", async () => {
        await expect(subject()).to.emit(ramp, "IntentFulfilled").withArgs(
          intentHash,
          depositId,
          onRamper.address,
          receiver.address,
          usdc(50),
          ZERO
        );
      });

      describe("when a sustainability fee is defined", async () => {
        beforeEach(async () => {
          await ramp.connect(owner.wallet).setSustainabilityFee(ether(0.01));
        });

        it("should transfer the usdc correctly to all parties", async () => {
          const receiverPreBalance = await usdcToken.balanceOf(receiver.address);
          const rampPreBalance = await usdcToken.balanceOf(ramp.address);
          const feeRecipientPreBalance = await usdcToken.balanceOf(feeRecipient.address);
  
          await subject();
  
          const receiverPostBalance = await usdcToken.balanceOf(receiver.address);
          const rampPostBalance = await usdcToken.balanceOf(ramp.address);
          const feeRecipientPostBalance = await usdcToken.balanceOf(feeRecipient.address);
  
          expect(receiverPostBalance).to.eq(receiverPreBalance.add(usdc(49.5)));
          expect(rampPostBalance).to.eq(rampPreBalance.sub(usdc(50)));
          expect(feeRecipientPostBalance).to.eq(feeRecipientPreBalance.add(usdc(0.5)));
        });

        it("should emit an IntentFulfilled event", async () => {
          await expect(subject()).to.emit(ramp, "IntentFulfilled").withArgs(
            intentHash,
            depositId,
            onRamper.address,
            receiver.address,
            usdc(49.5),
            usdc(0.5)
          );
        });
      });

      describe("when the intent zeroes out the deposit", async () => {
        beforeEach(async () => {
          await subject();

          await blockchain.increaseTimeAsync(ONE_DAY_IN_SECONDS.add(10).toNumber());

          await ramp.connect(onRamper.wallet).signalIntent(depositId, usdc(50), receiver.address);
          const currentTimestamp = await blockchain.getCurrentTimestamp();
          intentHash = calculateIntentHash(await calculateVenmoIdHash("2"), depositId, currentTimestamp);

          subjectSignals[1] = currentTimestamp;
          subjectSignals[4] = BigNumber.from(intentHash);
        });

        it("should prune the deposit", async () => {
          await subject();

          const accountInfo = await ramp.getAccountInfo(offRamper.address);
          const deposit = await ramp.getDeposit(depositId);

          expect(accountInfo.deposits).to.not.include(depositId);
          expect(deposit.remainingDeposits).to.eq(ZERO);
          expect(deposit.outstandingIntentAmount).to.eq(ZERO);
          expect(deposit.intentHashes).to.not.include(intentHash);
        });

        it("should emit a DepositClosed event", async () => {
          await expect(subject()).to.emit(ramp, "DepositClosed").withArgs(depositId, offRamper.address);
        });
      });

      describe("when the amount paid was not enough", async () => {
        beforeEach(async () => {
          subjectSignals[0] = usdc(50);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Payment was not enough");
        });
      });

      describe("when the email timestamp is before the intent was signaled", async () => {
        beforeEach(async () => {
          subjectSignals[1] = ONE;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent was not created before send");
        });
      });

      describe("when the intent has already been pruned", async () => {
        beforeEach(async () => {
          await subject();
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent does not exist");
        });
      });

      describe("when the offRamperIdHash doesn't match the intent", async () => {
        beforeEach(async () => {
          subjectSignals[2] = BigNumber.from(await calculateVenmoIdHash("2"));
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Offramper id does not match");
        });
      });

      describe("when the onRamperIdHash doesn't match the intent", async () => {
        beforeEach(async () => {
          subjectSignals[3] = BigNumber.from(await calculateVenmoIdHash("1"));
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Onramper id does not match");
        });
      });
    });

    describe("#withdrawDeposit", async () => {
      let subjectDepositIds: BigNumber[];
      let subjectCaller: Account;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          await calculatePackedVenmoId("1"),
          usdc(100),
          usdc(101)
        );

        await ramp.connect(offRamper.wallet).offRamp(
          await calculatePackedVenmoId("1"),
          usdc(50),
          usdc(51)
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

      it("should remove the deposits from the depositors account info", async () => {
        const preAccountInfo = await ramp.getAccountInfo(subjectCaller.address);
        expect(preAccountInfo.deposits[0]).to.eq(subjectDepositIds[0]);
        expect(preAccountInfo.deposits[1]).to.eq(subjectDepositIds[1]);

        await subject();

        const accountInfo = await ramp.getAccountInfo(subjectCaller.address);

        expect(accountInfo.deposits).to.not.include(subjectDepositIds[0]);
        expect(accountInfo.deposits).to.not.include(subjectDepositIds[1]);
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

      it("should emit DepositClosed events for both deposits", async () => {
        const tx = await subject();

        await expect(tx).to.emit(ramp, "DepositClosed").withArgs(subjectDepositIds[1], offRamper.address);
        await expect(tx).to.emit(ramp, "DepositClosed").withArgs(subjectDepositIds[1], offRamper.address);
      });

      describe("when there is an outstanding intent", async () => {
        beforeEach(async () => {
          await ramp.connect(onRamper.wallet).signalIntent(subjectDepositIds[0], usdc(50), receiver.address);
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

        it("should delete deposit two from deposits and account info", async () => {
          await subject();

          const depositTwo = await ramp.getDeposit(subjectDepositIds[1]);
          const accountInfo = await ramp.getAccountInfo(offRamper.address);

          expect(accountInfo.deposits).to.not.include(subjectDepositIds[1]);
          expect(depositTwo.depositor).to.eq(ADDRESS_ZERO);
        });

        it("should emit a DepositClosed event for deposit two", async () => {
          await expect(subject()).to.emit(ramp, "DepositClosed").withArgs(subjectDepositIds[1], offRamper.address);
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

            expect(postIntent.onRamper).to.eq(ADDRESS_ZERO);
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

    describe("#addAccountToDenylist", async () => {
      let subjectDeniedUser: string;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectDeniedUser = await calculateVenmoIdHash("2");
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).addAccountToDenylist(subjectDeniedUser);
      }

      it("should add the denied user to the denier's array and update mapping", async () => {
        await subject();

        const deniedUsers = await ramp.getDeniedUsers(subjectCaller.address);
        const isDenied = await ramp.isDeniedUser(subjectCaller.address, subjectDeniedUser);

        expect(deniedUsers).to.include(subjectDeniedUser);
        expect(isDenied).to.be.true;
      });

      it("should emit a UserAddedToDenylist event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "UserAddedToDenylist").withArgs(
          await calculateVenmoIdHash("1"),
          await calculateVenmoIdHash("2")
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
        await ramp.connect(offRamper.wallet).addAccountToDenylist(await calculateVenmoIdHash("2"));

        subjectApprovedUser = await calculateVenmoIdHash("2");
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).removeAccountFromDenylist(subjectApprovedUser);
      }

      it("should remove the denied user from the denier's array and update mapping", async () => {
        const preDeniedUsers = await ramp.getDeniedUsers(subjectCaller.address);

        expect(preDeniedUsers).to.include(subjectApprovedUser);

        await subject();

        const deniedUsers = await ramp.getDeniedUsers(subjectCaller.address);
        const isDenied = await ramp.isDeniedUser(subjectCaller.address, subjectApprovedUser);

        expect(deniedUsers).to.not.include(subjectApprovedUser);
        expect(isDenied).to.be.false;
      });

      it("should emit a UserRemovedFromDenylist event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "UserRemovedFromDenylist").withArgs(
          await calculateVenmoIdHash("1"),
          await calculateVenmoIdHash("2")
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

    describe("#setMinDepositAmount", async () => {
      let subjectMinDepositAmount: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectMinDepositAmount = usdc(10);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setMinDepositAmount(subjectMinDepositAmount);
      }

      it("should set the correct min deposit amount", async () => {
        await subject();

        const depositAmount = await ramp.minDepositAmount();

        expect(depositAmount).to.eq(subjectMinDepositAmount);
      });

      it("should emit a MinDepositAmountSet event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "MinDepositAmountSet").withArgs(subjectMinDepositAmount);
      });

      describe("when the min deposit amount is 0", async () => {
        beforeEach(async () => {
          subjectMinDepositAmount = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Minimum deposit cannot be zero");
        });
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#setMaxOnRampAmount", async () => {
      let subjectMaxOnRampAmount: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectMaxOnRampAmount = usdc(998);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setMaxOnRampAmount(subjectMaxOnRampAmount);
      }

      it("should set the correct max on ramp amount", async () => {
        const preMaxOnRampAmount = await ramp.maxOnRampAmount();

        expect(preMaxOnRampAmount).to.eq(usdc(999));

        await subject();

        const postMaxOnRampAmount = await ramp.maxOnRampAmount();

        expect(postMaxOnRampAmount).to.eq(subjectMaxOnRampAmount);
      });

      it("should emit a MaxOnRampAmountSet event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "MaxOnRampAmountSet").withArgs(subjectMaxOnRampAmount);
      });

      describe("when the max amount is 0", async () => {
        beforeEach(async () => {
          subjectMaxOnRampAmount = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Max on ramp amount cannot be zero");
        });
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#setIntentExpirationPeriod", async () => {
      let subjectIntentExpirationPeriod: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectIntentExpirationPeriod = ONE_DAY_IN_SECONDS.mul(2);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setIntentExpirationPeriod(subjectIntentExpirationPeriod);
      }

      it("should set the correct expiration time period", async () => {
        const preOnRampAmount = await ramp.intentExpirationPeriod();

        expect(preOnRampAmount).to.eq(ONE_DAY_IN_SECONDS);

        await subject();

        const postOnRampAmount = await ramp.intentExpirationPeriod();

        expect(postOnRampAmount).to.eq(subjectIntentExpirationPeriod);
      });

      it("should emit a IntentExpirationPeriodSet event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "IntentExpirationPeriodSet").withArgs(subjectIntentExpirationPeriod);
      });

      describe("when the intent expiration period is 0", async () => {
        beforeEach(async () => {
          subjectIntentExpirationPeriod = ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Max intent expiration period cannot be zero");
        });
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#setOnRampCooldownPeriod", async () => {
      let subjectOnRampCoolDownPeriod: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectOnRampCoolDownPeriod = ONE_DAY_IN_SECONDS.div(2);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setOnRampCooldownPeriod(subjectOnRampCoolDownPeriod);
      }

      it("should set the correct cool down time period", async () => {
        const preOnRampAmount = await ramp.onRampCooldownPeriod();

        expect(preOnRampAmount).to.eq(ONE_DAY_IN_SECONDS);

        await subject();

        const postOnRampAmount = await ramp.onRampCooldownPeriod();

        expect(postOnRampAmount).to.eq(subjectOnRampCoolDownPeriod);
      });

      it("should emit a OnRampCooldownPeriodSet event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "OnRampCooldownPeriodSet").withArgs(subjectOnRampCoolDownPeriod);
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#setSustainabilityFee", async () => {
      let subjectSustainabilityFee: BigNumber;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectSustainabilityFee = ether(.002);
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setSustainabilityFee(subjectSustainabilityFee);
      }

      it("should set the correct sustainability fee", async () => {
        const preSustainabilityFee = await ramp.sustainabilityFee();

        expect(preSustainabilityFee).to.eq(ZERO);

        await subject();

        const postSustainabilityFee = await ramp.sustainabilityFee();

        expect(postSustainabilityFee).to.eq(subjectSustainabilityFee);
      });

      it("should emit a SustainabilityFeeUpdated event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "SustainabilityFeeUpdated").withArgs(subjectSustainabilityFee);
      });

      describe("when the fee exceeds the max sustainability fee", async () => {
        beforeEach(async () => {
          subjectSustainabilityFee = ether(.1);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Fee cannot be greater than max fee");
        });
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#setSustainabilityFeeRecipient", async () => {
      let subjectSustainabilityFeeRecipient: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectSustainabilityFeeRecipient = owner.address;
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setSustainabilityFeeRecipient(subjectSustainabilityFeeRecipient);
      }

      it("should set the correct sustainability fee recipient", async () => {
        const preSustainabilityFeeRecipient = await ramp.sustainabilityFeeRecipient();

        expect(preSustainabilityFeeRecipient).to.eq(feeRecipient.address);

        await subject();

        const postSustainabilityFeeRecipient = await ramp.sustainabilityFeeRecipient();

        expect(postSustainabilityFeeRecipient).to.eq(subjectSustainabilityFeeRecipient);
      });

      it("should emit a SustainabilityFeeRecipientUpdated event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "SustainabilityFeeRecipientUpdated").withArgs(subjectSustainabilityFeeRecipient);
      });

      describe("when the passed fee recipient is the zero address", async () => {
        beforeEach(async () => {
          subjectSustainabilityFeeRecipient = ADDRESS_ZERO;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Fee recipient cannot be zero address");
        });
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#setSendProcessor", async () => {
      let subjectSendProcessor: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectSendProcessor = owner.address;
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setSendProcessor(subjectSendProcessor);
      }

      it("should set the correct min deposit amount", async () => {
        await subject();

        const newSendProcessor = await ramp.sendProcessor();

        expect(newSendProcessor).to.eq(subjectSendProcessor);
      });

      it("should emit a NewSendProcessorSet event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "NewSendProcessorSet").withArgs(subjectSendProcessor);
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#setRegistrationProcessor", async () => {
      let subjectRegistrationProcessor: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectRegistrationProcessor = owner.address;
        subjectCaller = owner;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).setRegistrationProcessor(subjectRegistrationProcessor);
      }

      it("should set the correct min deposit amount", async () => {
        await subject();

        const newRegistrationProcessor = await ramp.registrationProcessor();

        expect(newRegistrationProcessor).to.eq(subjectRegistrationProcessor);
      });

      it("should emit a NewRegistrationProcessorSet event", async () => {
        const tx = await subject();

        expect(tx).to.emit(ramp, "NewRegistrationProcessorSet").withArgs(subjectRegistrationProcessor);
      });

      describe("when the caller is not the owner", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });

    describe("#getAccountDeposits", async () => {
      let subjectAccount: Address;

      let intentHash: string;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          calculatePackedVenmoId("1"),
          usdc(100),
          usdc(101)
        );

        await ramp.connect(offRamper.wallet).offRamp(
          calculatePackedVenmoId("1"),
          usdc(100),
          usdc(102)
        );

        await ramp.connect(onRamper.wallet).signalIntent(ONE, usdc(50), receiver.address);
        intentHash = calculateIntentHash(await calculateVenmoIdHash("2"), ONE, await blockchain.getCurrentTimestamp());

        subjectAccount = offRamper.address;
      });

      async function subject(): Promise<any> {
        return ramp.getAccountDeposits(subjectAccount);
      }

      it("should return the expected deposits", async () => {
        const deposits = await subject();

        const conversionRateOne = usdc(100).mul(ether(1)).div(usdc(101));
        const conversionRateTwo = usdc(100).mul(ether(1)).div(usdc(102));

        expect(deposits[0].deposit.depositor).to.eq(offRamper.address);
        expect(deposits[1].deposit.depositor).to.eq(offRamper.address);
        expect(deposits[0].deposit.depositAmount).to.eq(usdc(100));
        expect(deposits[1].deposit.depositAmount).to.eq(usdc(100));
        expect(deposits[0].deposit.remainingDeposits).to.eq(usdc(100));
        expect(deposits[1].deposit.remainingDeposits).to.eq(usdc(50));
        expect(deposits[0].deposit.outstandingIntentAmount).to.eq(ZERO);
        expect(deposits[1].deposit.outstandingIntentAmount).to.eq(usdc(50));
        expect(deposits[0].deposit.conversionRate).to.eq(conversionRateOne);
        expect(deposits[1].deposit.conversionRate).to.eq(conversionRateTwo);
        expect(deposits[0].depositId).to.eq(ZERO);
        expect(deposits[1].depositId).to.eq(ONE);
        expect(deposits[0].availableLiquidity).to.eq(usdc(100));
        expect(deposits[1].availableLiquidity).to.eq(usdc(50));
      });

      describe("when there are reclaimable intents", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(ONE_DAY_IN_SECONDS.add(1).toNumber());
        });

        it("should return the expected deposits", async () => {
          const deposits = await subject();

          expect(deposits[0].availableLiquidity).to.eq(usdc(100));
          expect(deposits[1].availableLiquidity).to.eq(usdc(100));
        });
      });
    });

    describe("#getDepositFromIds", async () => {
      let subjectDepositIds: BigNumber[];

      let intentHash: string;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          calculatePackedVenmoId("1"),
          usdc(100),
          usdc(101)
        );

        await ramp.connect(offRamper.wallet).offRamp(
          calculatePackedVenmoId("1"),
          usdc(100),
          usdc(102)
        );

        await ramp.connect(onRamper.wallet).signalIntent(ONE, usdc(50), receiver.address);
        intentHash = calculateIntentHash(await calculateVenmoIdHash("2"), ONE, await blockchain.getCurrentTimestamp());

        subjectDepositIds = [ZERO, ONE];
      });

      async function subject(): Promise<any> {
        return ramp.getDepositFromIds(subjectDepositIds);
      }

      it("should return the expected deposits", async () => {
        const deposits = await subject();

        const conversionRateOne = usdc(100).mul(ether(1)).div(usdc(101));
        const conversionRateTwo = usdc(100).mul(ether(1)).div(usdc(102));

        expect(deposits[0].deposit.depositor).to.eq(offRamper.address);
        expect(deposits[1].deposit.depositor).to.eq(offRamper.address);
        expect(deposits[0].deposit.depositAmount).to.eq(usdc(100));
        expect(deposits[1].deposit.depositAmount).to.eq(usdc(100));
        expect(deposits[0].deposit.remainingDeposits).to.eq(usdc(100));
        expect(deposits[1].deposit.remainingDeposits).to.eq(usdc(50));
        expect(deposits[0].deposit.outstandingIntentAmount).to.eq(ZERO);
        expect(deposits[1].deposit.outstandingIntentAmount).to.eq(usdc(50));
        expect(deposits[0].deposit.conversionRate).to.eq(conversionRateOne);
        expect(deposits[1].deposit.conversionRate).to.eq(conversionRateTwo);
        expect(deposits[0].availableLiquidity).to.eq(usdc(100));
        expect(deposits[1].availableLiquidity).to.eq(usdc(50));
        expect(deposits[0].depositId).to.eq(ZERO);
        expect(deposits[1].depositId).to.eq(ONE);
      });

      describe("when there are reclaimable intents", async () => {
        beforeEach(async () => {
          await blockchain.increaseTimeAsync(ONE_DAY_IN_SECONDS.add(1).toNumber());
        });

        it("should return the expected deposits", async () => {
          const deposits = await subject();

          expect(deposits[0].availableLiquidity).to.eq(usdc(100));
          expect(deposits[1].availableLiquidity).to.eq(usdc(100));
        });
      });
    });

    describe("#getIntentsWithOnRamperId", async () => {
      let subjectIntentHashes: string[];

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          calculatePackedVenmoId("1"),
          usdc(100),
          usdc(101)
        );

        await ramp.connect(onRamper.wallet).signalIntent(ZERO, usdc(50), receiver.address);
        const intentHashOne = calculateIntentHash(await calculateVenmoIdHash("2"), ZERO, await blockchain.getCurrentTimestamp());
        await ramp.connect(onRamperTwo.wallet).signalIntent(ZERO, usdc(40), receiver.address);
        const intentHashTwo = calculateIntentHash(await calculateVenmoIdHash("3"), ZERO, await blockchain.getCurrentTimestamp());

        subjectIntentHashes = [intentHashOne, intentHashTwo];
      });

      async function subject(): Promise<any> {
        return ramp.getIntentsWithOnRamperId(subjectIntentHashes);
      }

      it("should return the expected intents", async () => {
        const intents = await subject();

        expect(intents[0].intent.onRamper).to.eq(onRamper.address);
        expect(intents[1].intent.onRamper).to.eq(onRamperTwo.address);
        expect(intents[0].intent.deposit).to.eq(ZERO);
        expect(intents[1].intent.deposit).to.eq(ZERO);
        expect(intents[0].intent.amount).to.eq(usdc(50));
        expect(intents[1].intent.amount).to.eq(usdc(40));
        expect(intents[0].onRamperIdHash).to.eq(await calculateVenmoIdHash("2"));
        expect(intents[1].onRamperIdHash).to.eq(await calculateVenmoIdHash("3"));
      });
    });
  });
});
