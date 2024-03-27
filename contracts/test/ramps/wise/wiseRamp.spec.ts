import "module-alias/register";

import { ethers } from "hardhat";

import {
  Address,
  WiseOffRamperRegistrationData,
  WiseRegistrationData,
  WiseRegistrationProof,
  WiseSendData,
} from "@utils/types";
import { Account } from "@utils/test/types";
import {
  WiseRamp,
  USDCMock,
  WiseAccountRegistry,
  WiseSendProcessorMock
} from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";
import { Blockchain, ether, usdc } from "@utils/common";
import { BigNumber } from "ethers";
import { ZERO, ZERO_BYTES32, ADDRESS_ZERO, ONE } from "@utils/constants";
import { calculateIntentHash, calculateWiseId, calculateWiseTagHash } from "@utils/protocolUtils";
import { ONE_DAY_IN_SECONDS } from "@utils/constants";

const expect = getWaffleExpect();

const blockchain = new Blockchain(ethers.provider);

describe("WiseRamp", () => {
  let owner: Account;
  let verifier: Account;
  let offRamper: Account;
  let offRamperNewAcct: Account;
  let onRamper: Account;
  let onRamperOtherAddress: Account;
  let onRamperTwo: Account;
  let receiver: Account;
  let maliciousOnRamper: Account;
  let unregisteredUser: Account;
  let feeRecipient: Account;

  let ramp: WiseRamp;
  let usdcToken: USDCMock;
  let accountRegistry: WiseAccountRegistry;
  let sendProcessor: WiseSendProcessorMock;

  let deployer: DeployHelper;

  beforeEach(async () => {
    [
      owner,
      verifier,
      offRamper,
      onRamper,
      onRamperOtherAddress,
      onRamperTwo,
      receiver,
      maliciousOnRamper,
      unregisteredUser,
      offRamperNewAcct,
      feeRecipient
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);

    usdcToken = await deployer.deployUSDCMock(usdc(1000000000), "USDC", "USDC");

    const accountRegistrationProcessor = await deployer.deployWiseAccountRegistrationProcessorMock();
    const offRamperRegistrationProcessor = await deployer.deployWiseOffRamperRegistrationProcessorMock();
    sendProcessor = await deployer.deployWiseSendProcessorMock();

    accountRegistry = await deployer.deployWiseAccountRegistry(owner.address);
    await accountRegistry.initialize(
      accountRegistrationProcessor.address,
      offRamperRegistrationProcessor.address
    );

    await usdcToken.transfer(offRamper.address, usdc(10000));

    ramp = await deployer.deployWiseRamp(
      owner.address,
      usdcToken.address,
      usdc(20),                          // $20 min deposit amount
      usdc(999),
      ONE_DAY_IN_SECONDS,
      ONE_DAY_IN_SECONDS,                // On ramp cooldown period
      ZERO,                              // Sustainability fee
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
    let subjectAccountRegistry: Address;
    let subjectSendProcessor: Address;
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectAccountRegistry = accountRegistry.address;
      subjectSendProcessor = sendProcessor.address;
      subjectCaller = owner;
    });

    async function subject(): Promise<any> {
      return ramp.connect(subjectCaller.wallet).initialize(
        subjectAccountRegistry,
        subjectSendProcessor
      );
    }

    it("should set the correct processor addresses", async () => {
      await subject();

      const accountRegistrationProcessorAddress: Address = await ramp.accountRegistry();
      const sendProcessorAddress: Address = await ramp.sendProcessor();

      expect(accountRegistrationProcessorAddress).to.eq(accountRegistry.address);
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

  context("when the on and off ramper are registered", async () => {
    let offRamperProof: WiseRegistrationProof;
    let onRamperProof: WiseRegistrationProof;
    let onRamperTwoProof: WiseRegistrationProof;
    let maliciousOnRamperProof: WiseRegistrationProof;

    let offRamperMCAccountId: string;

    beforeEach(async () => {
      await ramp.initialize(
        accountRegistry.address,
        sendProcessor.address
      );

      const standardRegistrationData: WiseRegistrationData = {
        endpoint: "GET https://api.transferwise.com/v4/profiles/41246868/multi-currency-account",
        host: "api.transferwise.com",
        profileId: "",
        wiseTagHash: ""
      }

      offRamperProof = { public_values: {...standardRegistrationData}, proof: "0x"};
      offRamperProof.public_values.profileId = "012345678";
      offRamperProof.public_values.wiseTagHash = calculateWiseTagHash("jdoe1234");
      onRamperProof = { public_values: {...standardRegistrationData}, proof: "0x"};
      onRamperProof.public_values.profileId = "123456789";
      onRamperTwoProof = { public_values: {...standardRegistrationData}, proof: "0x"};
      onRamperTwoProof.public_values.profileId = "567890123";
      maliciousOnRamperProof = { public_values: {...standardRegistrationData}, proof: "0x"};
      maliciousOnRamperProof.public_values.profileId = "123456789";

      await accountRegistry.connect(offRamper.wallet).register(offRamperProof);
      await accountRegistry.connect(onRamper.wallet).register(onRamperProof);
      await accountRegistry.connect(onRamperTwo.wallet).register(onRamperTwoProof);
      await accountRegistry.connect(maliciousOnRamper.wallet).register(maliciousOnRamperProof);

      offRamperMCAccountId = "402767982";

      const offRamperRegisterPublicValues = {
        endpoint: "GET https://api.transferwise.com/v4/profiles/41246868/multi-currency-account",
        host: "api.transferwise.com",
        profileId: "012345678",
        mcAccountId: offRamperMCAccountId
      } as WiseOffRamperRegistrationData

      await accountRegistry.connect(offRamper.wallet).registerAsOffRamper(
        { public_values: offRamperRegisterPublicValues, proof: "0x" }
      );

      await usdcToken.connect(offRamper.wallet).approve(ramp.address, usdc(10000));
    });

    describe("#offRamp", async () => {
      let subjectWiseTag: string;
      let subjectReceiveCurrencyId: string;
      let subjectDepositAmount: BigNumber;
      let subjectReceiveAmount: BigNumber;
      let subjectVerifierSigningKey: Address;
      let subjectCaller: Account;

      beforeEach(async () => {
        subjectWiseTag = "jdoe1234";
        subjectReceiveCurrencyId = ethers.utils.solidityKeccak256(["string"], ["EUR"]);
        subjectDepositAmount = usdc(100);
        subjectReceiveAmount = usdc(92);
        subjectVerifierSigningKey = verifier.address;

        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).offRamp(
          subjectWiseTag,
          subjectReceiveCurrencyId,
          subjectDepositAmount,
          subjectReceiveAmount,
          subjectVerifierSigningKey
        );
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
        expect(deposit.wiseTag).to.eq(subjectWiseTag);
        expect(deposit.verifierSigningKey).to.eq(subjectVerifierSigningKey);
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
          calculateWiseId("012345678"),
          subjectReceiveCurrencyId,
          subjectDepositAmount,
          conversionRate
        );
      });

      describe("when the user has not registered as on off-ramper", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Must be registered as off ramper");
        });
      });

      describe("when the wise tag doesn't match tag provided during registration", async () => {
        beforeEach(async () => {
          subjectWiseTag = "snakamoto1234"
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Wise tag does not match registered wise tag");
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
          await ramp.connect(subjectCaller.wallet).offRamp(subjectWiseTag, subjectReceiveCurrencyId, subjectDepositAmount, usdc(102), subjectVerifierSigningKey);
          await ramp.connect(subjectCaller.wallet).offRamp(subjectWiseTag, subjectReceiveCurrencyId, subjectDepositAmount, usdc(103), subjectVerifierSigningKey);
          await ramp.connect(subjectCaller.wallet).offRamp(subjectWiseTag, subjectReceiveCurrencyId, subjectDepositAmount, usdc(104), subjectVerifierSigningKey);
          await ramp.connect(subjectCaller.wallet).offRamp(subjectWiseTag, subjectReceiveCurrencyId, subjectDepositAmount, usdc(105), subjectVerifierSigningKey);
          await ramp.connect(subjectCaller.wallet).offRamp(subjectWiseTag, subjectReceiveCurrencyId, subjectDepositAmount, usdc(106), subjectVerifierSigningKey);
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
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address
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
        const intentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), subjectDepositId, currentTimestamp);

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

        const intentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), subjectDepositId, await blockchain.getCurrentTimestamp());

        const postDeposit = await ramp.getDeposit(subjectDepositId);

        expect(postDeposit.outstandingIntentAmount).to.eq(preDeposit.outstandingIntentAmount.add(subjectAmount));
        expect(postDeposit.remainingDeposits).to.eq(preDeposit.remainingDeposits.sub(subjectAmount));
        expect(postDeposit.intentHashes).to.include(intentHash);
      });

      it("should update the account's current intent hash", async () => {
        await subject();

        const expectedIntentHash = calculateIntentHash(
          calculateWiseId(onRamperProof.public_values.profileId),
          subjectDepositId,
          await blockchain.getCurrentTimestamp()
        );

        const intentHash = await ramp.getIdCurrentIntentHash(subjectCaller.address);

        expect(expectedIntentHash).to.eq(intentHash);
      });

      it("should emit an IntentSignaled event", async () => {
        const txn = await subject();

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        const intentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), subjectDepositId, currentTimestamp);

        expect(txn).to.emit(ramp, "IntentSignaled").withArgs(
          intentHash,
          subjectDepositId,
          calculateWiseId(onRamperProof.public_values.profileId),
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
          oldIntentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), subjectDepositId, currentTimestamp);

          await blockchain.increaseTimeAsync(timeJump);

          subjectAmount = usdc(60);
          subjectCaller = onRamperTwo;
        });

        it("should prune the intent and update the rest of the deposit mapping correctly", async () => {
          const preDeposit = await ramp.getDeposit(subjectDepositId);

          expect(preDeposit.intentHashes).to.include(oldIntentHash);

          await subject();

          const newIntentHash = calculateIntentHash(calculateWiseId(onRamperTwoProof.public_values.profileId), subjectDepositId, await blockchain.getCurrentTimestamp());
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
          const intentHash = calculateIntentHash(calculateWiseId(onRamperTwoProof.public_values.profileId), subjectDepositId, currentTimestamp);

          const intent = await ramp.intents(intentHash);

          expect(intent.onRamper).to.eq(subjectCaller.address);
          expect(intent.deposit).to.eq(subjectDepositId);
          expect(intent.amount).to.eq(subjectAmount);
          expect(intent.intentTimestamp).to.eq(currentTimestamp);
        });

        it("should update the account's current intent hash", async () => {
          await subject();

          const expectedIntentHash = calculateIntentHash(
            calculateWiseId(onRamperTwoProof.public_values.profileId),
            subjectDepositId,
            await blockchain.getCurrentTimestamp()
          );

          const intentHash = await ramp.getIdCurrentIntentHash(subjectCaller.address);

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

      describe("when isAllowedUser is false", async () => {
        beforeEach(async () => {
          await accountRegistry.connect(offRamper.wallet).addAccountToDenylist(calculateWiseId(onRamperProof.public_values.profileId));
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
          await accountRegistry.connect(offRamperNewAcct.wallet).register(offRamperProof);

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

          const depositId = (await ramp.depositCounter()).sub(1);
  
          const currentTimestamp = await blockchain.getCurrentTimestamp();
          const intentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), depositId, currentTimestamp);
          
          const sendData = {
            endpoint: "https://api.transferwise.com/v1/quotes",
            endpointType: "POST",
            host: "api.transferwise.com",
            transferId: "736281573",
            senderId: onRamperProof.public_values.profileId,
            recipientId: offRamperMCAccountId,
            timestamp: currentTimestamp.toString(),
            currencyId: "EUR",
            amount: "46.00",
            status: "outgoing_payment_sent",
            intentHash: intentHash
          }
          const verifierSignature = "0x";

          return ramp.connect(subjectCaller.wallet).onRamp(sendData, verifierSignature);
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
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(101),
          verifier.address
        );

        const idHash = calculateWiseId(onRamperProof.public_values.profileId);
        depositId = ZERO;

        await ramp.connect(onRamper.wallet).signalIntent(depositId, usdc(50), receiver.address);

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        subjectIntentHash = calculateIntentHash(idHash, depositId, currentTimestamp);

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

      it("should update the accounts current intent hash", async () => {
        await subject();

        const intentHash = await ramp.getIdCurrentIntentHash(subjectCaller.address);

        expect(intentHash).to.eq(ZERO_BYTES32);
      });

      it("should emit an IntentPruned event", async () => {
        await expect(subject()).to.emit(ramp, "IntentPruned").withArgs(subjectIntentHash, depositId);
      });

      describe("when the call comes from a different Eth address tied to the same venmoIdHash", async () => {
        beforeEach(async () => {
          await accountRegistry.connect(onRamperOtherAddress.wallet).register(onRamperProof);

          subjectCaller = onRamperOtherAddress;
        });

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
  
        it("should update the accounts current intent hash", async () => {
          await subject();
  
          const intentHash = await ramp.getIdCurrentIntentHash(onRamper.address);
  
          expect(intentHash).to.eq(ZERO_BYTES32);
        });
  
        it("should emit an IntentPruned event", async () => {
          await expect(subject()).to.emit(ramp, "IntentPruned").withArgs(subjectIntentHash, depositId);
        });
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
      let subjectSendData: WiseSendData;
      let subjectNotarySignature: string;
      let subjectCaller: Account;

      let depositId: BigNumber;
      let intentHash: string;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address
        );

        depositId = (await ramp.depositCounter()).sub(1);

        const idHash = calculateWiseId(onRamperProof.public_values.profileId);
        await ramp.connect(onRamper.wallet).signalIntent(depositId, usdc(50), receiver.address);

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        intentHash = calculateIntentHash(idHash, depositId, currentTimestamp);
        
        subjectSendData = {
          endpoint: "POST https://api.transferwise.com/v1/quotes",
          host: "api.transferwise.com",
          transferId: "736281573",
          senderId: onRamperProof.public_values.profileId,
          recipientId: offRamperMCAccountId,
          timestamp: currentTimestamp.toString(),
          currencyId: "EUR",
          amount: "46.00",
          status: "outgoing_payment_sent",
          intentHash: BigNumber.from(intentHash)
        }
        subjectNotarySignature = "0x";
        subjectCaller = onRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).onRamp(subjectSendData, subjectNotarySignature);
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
          intentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), depositId, currentTimestamp);

          subjectSendData.timestamp = currentTimestamp.toString();
          subjectSendData.intentHash = BigNumber.from(intentHash);
        });

        it("should prune the deposit", async () => {
          await subject();

          const accountDeposits = await ramp.getAccountDeposits(offRamper.address);
          const deposit = await ramp.getDeposit(depositId);

          expect(accountDeposits.some(obj => obj.depositId == depositId)).to.be.false;
          expect(deposit.remainingDeposits).to.eq(ZERO);
          expect(deposit.outstandingIntentAmount).to.eq(ZERO);
          expect(deposit.intentHashes).to.not.include(intentHash);
        });

        it("should emit a DepositClosed event", async () => {
          await expect(subject()).to.emit(ramp, "DepositClosed").withArgs(depositId, offRamper.address);
        });
      });

      describe("when the caller is not the onRamper for the intent", async () => {
        beforeEach(async () => {
          subjectSendData.intentHash = BigNumber.from(ZERO_BYTES32);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be the on-ramper");
        });
      });

      describe("when the payment was in the incorrect currecy", async () => {
        beforeEach(async () => {
          subjectSendData.currencyId = "SGD";
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Wrong currency sent");
        });
      });

      describe("when the amount paid was not enough", async () => {
        beforeEach(async () => {
          subjectSendData.amount = "45.00";
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Payment was not enough");
        });
      });

      describe("when the email timestamp is before the intent was signaled", async () => {
        beforeEach(async () => {
          subjectSendData.timestamp = ONE.toString();
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
          await expect(subject()).to.be.revertedWith("Caller must be the on-ramper");
        });
      });

      describe("when the offRamperId doesn't match the intent", async () => {
        beforeEach(async () => {
          subjectSendData.recipientId = calculateWiseId("124466989");
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Offramper id does not match");
        });
      });

      describe("when the onRamperId doesn't match the intent", async () => {
        beforeEach(async () => {
          subjectSendData.senderId = calculateWiseId(onRamperTwoProof.public_values.profileId);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Onramper id does not match");
        });
      });
    });

    describe("#releaseFundsToOnramper", async () => {
      let subjectIntentHash: string;
      let subjectCaller: Account;

      let depositId: BigNumber;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address,
        );

        depositId = (await ramp.depositCounter()).sub(1);

        const idHash = calculateWiseId(onRamperProof.public_values.profileId);
        await ramp.connect(onRamper.wallet).signalIntent(depositId, usdc(50), receiver.address);

        const currentTimestamp = await blockchain.getCurrentTimestamp();
        subjectIntentHash = calculateIntentHash(idHash, depositId, currentTimestamp);
        subjectCaller = offRamper;
      });

      async function subject(): Promise<any> {
        return ramp.connect(subjectCaller.wallet).releaseFundsToOnramper(subjectIntentHash);
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

        const intent = await ramp.intents(subjectIntentHash);

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
        expect(postDeposit.intentHashes).to.not.include(subjectIntentHash);
      });

      it("should log the block timestamp for user's lastOnrampTimestamp", async () => {
        await subject();

        const expectedLastOnRampTimestamp = await blockchain.getCurrentTimestamp();
        const lastOnRampTimestamp = await ramp.getLastOnRampTimestamp(onRamper.address);

        expect(lastOnRampTimestamp).to.eq(expectedLastOnRampTimestamp);
      });

      it("should emit an IntentFulfilled event", async () => {
        await expect(subject()).to.emit(ramp, "IntentFulfilled").withArgs(
          subjectIntentHash,
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
            subjectIntentHash,
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
          subjectIntentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), depositId, currentTimestamp);
        });

        it("should prune the deposit", async () => {
          await subject();

          const accountDeposits = await ramp.getAccountDeposits(offRamper.address);
          const deposit = await ramp.getDeposit(depositId);

          expect(accountDeposits.some(obj => obj.depositId == depositId)).to.be.false;
          expect(deposit.remainingDeposits).to.eq(ZERO);
          expect(deposit.outstandingIntentAmount).to.eq(ZERO);
          expect(deposit.intentHashes).to.not.include(subjectIntentHash);
        });

        it("should emit a DepositClosed event", async () => {
          await expect(subject()).to.emit(ramp, "DepositClosed").withArgs(depositId, offRamper.address);
        });
      });

      describe("when the intent does not exist", async () => {
        beforeEach(async () => {
          subjectIntentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), depositId, ONE);
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Intent does not exist");
        });
      });

      describe("when the sender is not the depositor", async () => {
        beforeEach(async () => {
          subjectCaller = onRamper;
        });

        it("should revert", async () => {
          await expect(subject()).to.be.revertedWith("Caller must be the depositor");
        });
      });
    });

    describe("#withdrawDeposit", async () => {
      let subjectDepositIds: BigNumber[];
      let subjectCaller: Account;

      beforeEach(async () => {
        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address
        );

        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(50),
          usdc(45),
          verifier.address
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
        const preAccountDeposits = await ramp.getAccountDeposits(subjectCaller.address);
        expect(preAccountDeposits[0].depositId).to.eq(subjectDepositIds[0]);
        expect(preAccountDeposits[1].depositId).to.eq(subjectDepositIds[1]);

        await subject();

        const postAccountDeposits = await ramp.getAccountDeposits(subjectCaller.address);

        expect(postAccountDeposits.some(obj => obj.depositId == subjectDepositIds[0])).to.be.false;
        expect(postAccountDeposits.some(obj => obj.depositId == subjectDepositIds[1])).to.be.false;
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
          const accountDeposits = await ramp.getAccountDeposits(offRamper.address);

          expect(accountDeposits.some(obj => obj.depositId == subjectDepositIds[1])).to.be.false;
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

    describe("#getIdCurrentIntentHashAsUint", async () => {
      let subjectAccount: Address;

      let intentHash: string;

      beforeEach(async () => {  
        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address
        );

        await ramp.connect(onRamper.wallet).signalIntent(ZERO, usdc(50), receiver.address);
        intentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), ZERO, await blockchain.getCurrentTimestamp());

        subjectAccount = onRamper.address;
      });

      async function subject(): Promise<any> {
        return ramp.getIdCurrentIntentHashAsUint(subjectAccount);
      }

      it("should return the expected deposits", async () => {
        const intentHashAsUint = await subject();

        expect(intentHashAsUint).to.eq(BigNumber.from(intentHash));
      });
    });


    describe("#getAccountDeposits", async () => {
      let subjectAccount: Address;

      beforeEach(async () => {  
        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address
        );

        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(93),
          verifier.address
        );

        await ramp.connect(onRamper.wallet).signalIntent(ONE, usdc(50), receiver.address);

        subjectAccount = offRamper.address;
      });

      async function subject(): Promise<any> {
        return ramp.getAccountDeposits(subjectAccount);
      }

      it("should return the expected deposits", async () => {
        const deposits = await subject();

        const conversionRateOne = usdc(100).mul(ether(1)).div(usdc(92));
        const conversionRateTwo = usdc(100).mul(ether(1)).div(usdc(93));

        expect(deposits[0].deposit.depositor).to.eq(offRamper.address);
        expect(deposits[1].deposit.depositor).to.eq(offRamper.address);
        expect(deposits[0].deposit.wiseTag).to.eq("jdoe1234");
        expect(deposits[1].deposit.wiseTag).to.eq("jdoe1234");
        expect(deposits[0].deposit.depositAmount).to.eq(usdc(100));
        expect(deposits[1].deposit.depositAmount).to.eq(usdc(100));
        expect(deposits[0].deposit.remainingDeposits).to.eq(usdc(100));
        expect(deposits[1].deposit.remainingDeposits).to.eq(usdc(50));
        expect(deposits[0].deposit.outstandingIntentAmount).to.eq(ZERO);
        expect(deposits[1].deposit.outstandingIntentAmount).to.eq(usdc(50));
        expect(deposits[0].deposit.conversionRate).to.eq(conversionRateOne);
        expect(deposits[1].deposit.conversionRate).to.eq(conversionRateTwo);
        expect(deposits[0].deposit.verifierSigningKey).to.eq(verifier.address);
        expect(deposits[1].deposit.verifierSigningKey).to.eq(verifier.address);
        expect(deposits[0].depositorId).to.eq(calculateWiseId(offRamperProof.public_values.profileId));
        expect(deposits[1].depositorId).to.eq(calculateWiseId(offRamperProof.public_values.profileId));
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
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address
        );

        await ramp.connect(offRamper.wallet).offRamp(
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(93),
          verifier.address
        );

        await ramp.connect(onRamper.wallet).signalIntent(ONE, usdc(50), receiver.address);
        intentHash = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), ONE, await blockchain.getCurrentTimestamp());


        subjectDepositIds = [ZERO, ONE];
      });

      async function subject(): Promise<any> {
        return ramp.getDepositFromIds(subjectDepositIds);
      }

      it("should return the expected deposits", async () => {
        const deposits = await subject();

        const conversionRateOne = usdc(100).mul(ether(1)).div(usdc(92));
        const conversionRateTwo = usdc(100).mul(ether(1)).div(usdc(93));

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
        expect(deposits[0].depositorId).to.eq(calculateWiseId(offRamperProof.public_values.profileId));
        expect(deposits[1].depositorId).to.eq(calculateWiseId(offRamperProof.public_values.profileId));
        expect(deposits[0].depositId).to.eq(ZERO);
        expect(deposits[1].depositId).to.eq(ONE);
        expect(JSON.stringify(deposits[0].deposit.intentHashes)).to.eq(JSON.stringify([]));
        expect(JSON.stringify(deposits[1].deposit.intentHashes)).to.eq(JSON.stringify([intentHash]));
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
          "jdoe1234",
          ethers.utils.solidityKeccak256(["string"], ["EUR"]),
          usdc(100),
          usdc(92),
          verifier.address
        );

        await ramp.connect(onRamper.wallet).signalIntent(ZERO, usdc(50), receiver.address);
        const intentHashOne = calculateIntentHash(calculateWiseId(onRamperProof.public_values.profileId), ZERO, await blockchain.getCurrentTimestamp());
        await ramp.connect(onRamperTwo.wallet).signalIntent(ZERO, usdc(40), receiver.address);
        const intentHashTwo = calculateIntentHash(calculateWiseId(onRamperTwoProof.public_values.profileId), ZERO, await blockchain.getCurrentTimestamp());

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
        expect(intents[0].onRamperId).to.eq(calculateWiseId(onRamperProof.public_values.profileId));
        expect(intents[1].onRamperId).to.eq(calculateWiseId(onRamperTwoProof.public_values.profileId));
        expect(intents[0].intentHash).to.eq(subjectIntentHashes[0]);
        expect(intents[1].intentHash).to.eq(subjectIntentHashes[1]);
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
});
