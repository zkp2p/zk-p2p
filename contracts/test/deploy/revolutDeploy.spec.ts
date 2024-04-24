import "module-alias/register";

import { deployments, ethers } from "hardhat";

import {
  NullifierRegistry,
  RevolutRamp,
  RevolutAccountRegistry,
  RevolutAccountRegistrationProcessor,
  RevolutSendProcessor,
} from "../../utils/contracts"
import {
  NullifierRegistry__factory,
  RevolutRamp__factory,
  RevolutAccountRegistry__factory,
  RevolutAccountRegistrationProcessor__factory,
  RevolutSendProcessor__factory,
} from "../../typechain"

import {
  getAccounts,
  getWaffleExpect,
} from "../../utils/test";
import {
  Account
} from "../../utils/test/types";
import {
  Address
} from "../../utils/types";

import {
  ACCOUNT_TLS_PARAMS,
  INTENT_EXPIRATION_PERIOD,
  MAX_ONRAMP_AMOUNT,
  MIN_DEPOSIT_AMOUNT,
  MULTI_SIG,
  ONRAMP_COOL_DOWN_PERIOD,
  SUSTAINABILITY_FEE,
  SUSTAINABILITY_FEE_RECIPIENT,
  TIMESTAMP_BUFFER,
  USDC,
} from "../../deployments/parameters";
import { PaymentProviders } from "../../utils/types"

const expect = getWaffleExpect();

const paymentProvider = PaymentProviders.Revolut;

describe("Revolut Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let wiseRamp: RevolutRamp;
  let wiseAccountRegistry: RevolutAccountRegistry;
  let wiseAccountRegistrationProcessor: RevolutAccountRegistrationProcessor;
  let wiseSendProcessor: RevolutSendProcessor;
  let nullifierRegistry: NullifierRegistry;

  const network: string = deployments.getNetworkName();

  function getDeployedContractAddress(network: string, contractName: string): string {
    return require(`../../deployments/${network}/${contractName}.json`).address;
  }

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer.address;

    const wiseRampAddress  = await getDeployedContractAddress(network, "RevolutRamp");
    wiseRamp = new RevolutRamp__factory(deployer.wallet).attach(wiseRampAddress);

    const wiseAccountRegistryAddress  = await getDeployedContractAddress(network, "RevolutAccountRegistry");
    wiseAccountRegistry = new RevolutAccountRegistry__factory(deployer.wallet).attach(wiseAccountRegistryAddress);

    const wiseAccountRegistrationProcessorAddress  = await getDeployedContractAddress(network, "RevolutAccountRegistrationProcessor");
    wiseAccountRegistrationProcessor = new RevolutAccountRegistrationProcessor__factory(deployer.wallet).attach(wiseAccountRegistrationProcessorAddress);

    const wiseSendProcessorAddress  = await getDeployedContractAddress(network, "RevolutSendProcessor");
    wiseSendProcessor = new RevolutSendProcessor__factory(deployer.wallet).attach(wiseSendProcessorAddress);

    const nullifierRegistryAddress  = await getDeployedContractAddress(network, "NullifierRegistry");
    nullifierRegistry = new NullifierRegistry__factory(deployer.wallet).attach(nullifierRegistryAddress);
  });

  describe("RevolutRamp", async () => {
    it("should have the correct processors, usdc, and poseidon set", async () => {
      const actualAccountRegistry = await wiseRamp.accountRegistry();
      const actualSendProcessor = await wiseRamp.sendProcessor();
      const actualUsdc = await wiseRamp.usdc();
      const isInitialized = await wiseAccountRegistry.isInitialized();

      const expectedUsdc = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

      expect(actualAccountRegistry).to.eq(wiseAccountRegistry.address);
      expect(actualSendProcessor).to.eq(wiseSendProcessor.address);
      expect(actualUsdc).to.eq(expectedUsdc);
      expect(isInitialized).to.be.true;
    });

    it("should have the correct limitations set", async () => {
      const actualCoolDownPeriod = await wiseRamp.onRampCooldownPeriod();
      const actualMinDepositAmount = await wiseRamp.minDepositAmount();
      const actualMaxOnRampAmount = await wiseRamp.maxOnRampAmount();
      const actualIntentExpirationPeriod = await wiseRamp.intentExpirationPeriod();

      expect(actualCoolDownPeriod).to.eq(ONRAMP_COOL_DOWN_PERIOD[paymentProvider][network]);
      expect(actualMinDepositAmount).to.eq(MIN_DEPOSIT_AMOUNT[paymentProvider][network]);
      expect(actualMaxOnRampAmount).to.eq(MAX_ONRAMP_AMOUNT[paymentProvider][network]);
      expect(actualIntentExpirationPeriod).to.eq(INTENT_EXPIRATION_PERIOD[paymentProvider][network]);
    });

    it("should correctly fee and ownership params", async () => {
      const actualSustainabilityFee = await wiseRamp.sustainabilityFee();
      const actualSustainabilityFeeRecipient = await wiseRamp.sustainabilityFeeRecipient();
      const actualOwner = await wiseRamp.owner();

      const expectedSustainabilityFeeRecipient = SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network] != ""
        ? SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network]
        : deployer.address;

      expect(actualSustainabilityFee).to.eq(SUSTAINABILITY_FEE[paymentProvider][network]);
      expect(actualSustainabilityFeeRecipient).to.eq(expectedSustainabilityFeeRecipient);
      expect(actualOwner).to.eq(multiSig);
    });
  });

  describe("RevolutAccountRegistry", async () => {
    it("should have the correct processors, usdc, and poseidon set", async () => {
      const actualAccountRegistrationProcessor = await wiseAccountRegistry.accountRegistrationProcessor();
      const isInitialized = await wiseAccountRegistry.isInitialized();

      expect(actualAccountRegistrationProcessor).to.eq(wiseAccountRegistrationProcessor.address);
      expect(isInitialized).to.be.true;
    });
  });


  describe("RevolutAccountRegistrationProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await wiseAccountRegistrationProcessor.ramp();
      const actualOwner = await wiseAccountRegistrationProcessor.owner();
      const actualNullifierRegistry = await wiseAccountRegistrationProcessor.nullifierRegistry();
      const actualAccountEndpoint = await wiseAccountRegistrationProcessor.endpoint();
      const actualAccountHost = await wiseAccountRegistrationProcessor.host();
      const actualAccountVerifierSigningKey = await wiseAccountRegistrationProcessor.verifierSigningKey();
      const actualTimestampBuffer = await wiseAccountRegistrationProcessor.timestampBuffer();

      expect(actualRamp).to.eq(wiseAccountRegistry.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(actualAccountEndpoint).to.eq(ACCOUNT_TLS_PARAMS[paymentProvider][network].endpoint);
      expect(actualAccountHost).to.eq(ACCOUNT_TLS_PARAMS[paymentProvider][network].host);
      expect(actualAccountVerifierSigningKey).to.eq(ACCOUNT_TLS_PARAMS[paymentProvider][network].verifierSigningKey);
      expect(actualTimestampBuffer).to.eq(0);
    });
  });

  describe("RevolutSendProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await wiseSendProcessor.ramp();
      const actualOwner = await wiseSendProcessor.owner();
      const actualNullifierRegistry = await wiseSendProcessor.nullifierRegistry();
      const actualTimestampBuffer = await wiseSendProcessor.timestampBuffer();

      expect(actualRamp).to.eq(wiseRamp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(actualTimestampBuffer).to.eq(TIMESTAMP_BUFFER[paymentProvider]);
    });
  });

  describe("NullifierRegistry", async () => {
    it("should have the correct write permissions set", async () => {
      const sendHasWritePermission = await nullifierRegistry.isWriter(wiseSendProcessor.address);
      const accountRegistrationHasWritePermission = await nullifierRegistry.isWriter(wiseAccountRegistrationProcessor.address);

      expect(sendHasWritePermission).to.be.true;
      expect(accountRegistrationHasWritePermission).to.be.true;
    });
  });
});
