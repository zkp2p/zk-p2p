import "module-alias/register";

import { deployments, ethers } from "hardhat";

import {
  ManagedKeyHashAdapterV2,
  NullifierRegistry,
  GarantiRamp,
  GarantiRegistrationProcessor,
  GarantiSendProcessor,
} from "../../utils/contracts"
import {
  ManagedKeyHashAdapterV2__factory,
  NullifierRegistry__factory,
  GarantiRamp__factory,
  GarantiRegistrationProcessor__factory,
  GarantiSendProcessor__factory,
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
  FROM_EMAIL,
  INTENT_EXPIRATION_PERIOD,
  MAX_ONRAMP_AMOUNT,
  MIN_DEPOSIT_AMOUNT,
  MULTI_SIG,
  ONRAMP_COOL_DOWN_PERIOD,
  SERVER_KEY_HASH,
  SUSTAINABILITY_FEE,
  SUSTAINABILITY_FEE_RECIPIENT,
  TIMESTAMP_BUFFER,
  USDC,
} from "../../deployments/parameters";
import { PaymentProviders } from "../../utils/types"

const expect = getWaffleExpect();

const paymentProvider = PaymentProviders.Garanti;

describe("Garanti Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let garantiRamp: GarantiRamp;
  let garantiRegistrationProcessor: GarantiRegistrationProcessor;
  let garantiSendProcessor: GarantiSendProcessor;
  let nullifierRegistry: NullifierRegistry;
  let keyHashAdapter: ManagedKeyHashAdapterV2;

  const network: string = deployments.getNetworkName();

  function getDeployedContractAddress(network: string, contractName: string): string {
    return require(`../../deployments/${network}/${contractName}.json`).address;
  }

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer.address;

    const garantiRampAddress  = await getDeployedContractAddress(network, "GarantiRamp");
    garantiRamp = new GarantiRamp__factory(deployer.wallet).attach(garantiRampAddress);

    const garantiRegistrationProcessorAddress  = await getDeployedContractAddress(network, "GarantiRegistrationProcessor");
    garantiRegistrationProcessor = new GarantiRegistrationProcessor__factory(deployer.wallet).attach(garantiRegistrationProcessorAddress);

    const garantiSendProcessorAddress  = await getDeployedContractAddress(network, "GarantiSendProcessor");
    garantiSendProcessor = new GarantiSendProcessor__factory(deployer.wallet).attach(garantiSendProcessorAddress);

    const nullifierRegistryAddress  = await getDeployedContractAddress(network, "NullifierRegistry");
    nullifierRegistry = new NullifierRegistry__factory(deployer.wallet).attach(nullifierRegistryAddress);

    const keyHashAdapterAddress  = await getDeployedContractAddress(network, "GarantiManagedKeyHashAdapter");
    keyHashAdapter = new ManagedKeyHashAdapterV2__factory(deployer.wallet).attach(keyHashAdapterAddress);
  });

  describe("GarantiRamp", async () => {
    it("should have the correct processors, usdc, and poseidon set", async () => {
      const actualRegistrationProcessor = await garantiRamp.registrationProcessor();
      const actualSendProcessor = await garantiRamp.sendProcessor();
      const actualUsdc = await garantiRamp.usdc();

      const expectedUsdc = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

      expect(actualRegistrationProcessor).to.eq(garantiRegistrationProcessor.address);
      expect(actualSendProcessor).to.eq(garantiSendProcessor.address);
      expect(actualUsdc).to.eq(expectedUsdc);
    });

    it("should have the correct limitations set", async () => {
      const actualCoolDownPeriod = await garantiRamp.onRampCooldownPeriod();
      const actualMinDepositAmount = await garantiRamp.minDepositAmount();
      const actualMaxOnRampAmount = await garantiRamp.maxOnRampAmount();
      const actualIntentExpirationPeriod = await garantiRamp.intentExpirationPeriod();

      expect(actualCoolDownPeriod).to.eq(ONRAMP_COOL_DOWN_PERIOD[paymentProvider][network]);
      expect(actualMinDepositAmount).to.eq(MIN_DEPOSIT_AMOUNT[paymentProvider][network]);
      expect(actualMaxOnRampAmount).to.eq(MAX_ONRAMP_AMOUNT[paymentProvider][network]);
      expect(actualIntentExpirationPeriod).to.eq(INTENT_EXPIRATION_PERIOD[paymentProvider][network]);
    });

    it("should correctly fee and ownership params", async () => {
      const actualSustainabilityFee = await garantiRamp.sustainabilityFee();
      const actualSustainabilityFeeRecipient = await garantiRamp.sustainabilityFeeRecipient();
      const actualOwner = await garantiRamp.owner();

      const expectedSustainabilityFeeRecipient = SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network] != ""
        ? SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network]
        : deployer.address;

      expect(actualSustainabilityFee).to.eq(SUSTAINABILITY_FEE[paymentProvider][network]);
      expect(actualSustainabilityFeeRecipient).to.eq(expectedSustainabilityFeeRecipient);
      expect(actualOwner).to.eq(multiSig);
    });
  });

  describe("GarantiRegistrationProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await garantiRegistrationProcessor.ramp();
      const actualOwner = await garantiRegistrationProcessor.owner();
      const actualKeyHashAdapter = await garantiRegistrationProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await garantiRegistrationProcessor.nullifierRegistry();
      const actualBodyHashVerifier = await garantiSendProcessor.bodyHashVerifier();
      const actualEmailFromAddress = await garantiRegistrationProcessor.emailFromAddress();
      const actualTimestampBuffer = await garantiRegistrationProcessor.timestampBuffer();

      expect(actualRamp).to.eq(garantiRamp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(actualBodyHashVerifier).to.eq(getDeployedContractAddress(network, "GarantiBodyHashVerifier"))
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL[paymentProvider]));
      expect(actualTimestampBuffer).to.eq(0);
    });
  });

  describe("GarantiSendProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await garantiSendProcessor.ramp();
      const actualOwner = await garantiSendProcessor.owner();
      const actualKeyHashAdapter = await garantiSendProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await garantiSendProcessor.nullifierRegistry();
      const actualBodyHashVerifier = await garantiSendProcessor.bodyHashVerifier();
      const actualEmailFromAddress = await garantiSendProcessor.emailFromAddress();
      const actualTimestampBuffer = await garantiSendProcessor.timestampBuffer();

      expect(actualRamp).to.eq(garantiRamp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(actualBodyHashVerifier).to.eq(getDeployedContractAddress(network, "GarantiBodyHashVerifier"));
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL[paymentProvider]));
      expect(actualTimestampBuffer).to.eq(TIMESTAMP_BUFFER[paymentProvider]);
    });
  });

  describe("ManagedKeyHashAdapterV2", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await keyHashAdapter.owner();
      const actualMailserverKeyHashes = await keyHashAdapter.getMailServerKeyHashes();

      expect(actualOwner).to.eq(multiSig);
      expect(actualMailserverKeyHashes).to.contain(SERVER_KEY_HASH[paymentProvider][0]);
    });
  });

  describe("NullifierRegistry", async () => {
    it("should have the correct write permissions set", async () => {
      const sendHasWritePermission = await nullifierRegistry.isWriter(garantiSendProcessor.address);
      const registrationHasWritePermission = await nullifierRegistry.isWriter(garantiRegistrationProcessor.address);

      expect(sendHasWritePermission).to.be.true;
      expect(registrationHasWritePermission).to.be.true;
    });
  });
});
