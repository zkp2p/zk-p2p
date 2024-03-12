import "module-alias/register";

import { deployments, ethers } from "hardhat";

import {
  NullifierRegistry,
  WiseRamp,
  WiseRegistrationProcessor,
  WiseSendProcessor,
} from "../../utils/contracts"
import {
  NullifierRegistry__factory,
  WiseRamp__factory,
  WiseRegistrationProcessor__factory,
  WiseSendProcessor__factory,
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
  OFFRAMPER_TLS_PARAMS,
  ONRAMP_COOL_DOWN_PERIOD,
  SUSTAINABILITY_FEE,
  SUSTAINABILITY_FEE_RECIPIENT,
  TIMESTAMP_BUFFER,
  USDC,
} from "../../deployments/parameters";
import { PaymentProviders } from "../../utils/types"

const expect = getWaffleExpect();

const paymentProvider = PaymentProviders.Wise;

describe("Wise Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let wiseRamp: WiseRamp;
  let wiseRegistrationProcessor: WiseRegistrationProcessor;
  let wiseSendProcessor: WiseSendProcessor;
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

    const wiseRampAddress  = await getDeployedContractAddress(network, "WiseRamp");
    wiseRamp = new WiseRamp__factory(deployer.wallet).attach(wiseRampAddress);

    const wiseRegistrationProcessorAddress  = await getDeployedContractAddress(network, "WiseRegistrationProcessor");
    wiseRegistrationProcessor = new WiseRegistrationProcessor__factory(deployer.wallet).attach(wiseRegistrationProcessorAddress);

    const wiseSendProcessorAddress  = await getDeployedContractAddress(network, "WiseSendProcessor");
    wiseSendProcessor = new WiseSendProcessor__factory(deployer.wallet).attach(wiseSendProcessorAddress);

    const nullifierRegistryAddress  = await getDeployedContractAddress(network, "NullifierRegistry");
    nullifierRegistry = new NullifierRegistry__factory(deployer.wallet).attach(nullifierRegistryAddress);
  });

  describe("WiseRamp", async () => {
    it("should have the correct processors, usdc, and poseidon set", async () => {
      const actualRegistrationProcessor = await wiseRamp.registrationProcessor();
      const actualSendProcessor = await wiseRamp.sendProcessor();
      const actualUsdc = await wiseRamp.usdc();

      const expectedUsdc = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

      expect(actualRegistrationProcessor).to.eq(wiseRegistrationProcessor.address);
      expect(actualSendProcessor).to.eq(wiseSendProcessor.address);
      expect(actualUsdc).to.eq(expectedUsdc);
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

  describe("WiseRegistrationProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await wiseRegistrationProcessor.ramp();
      const actualOwner = await wiseRegistrationProcessor.owner();
      const actualKeyHashAdapter = await wiseRegistrationProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await wiseRegistrationProcessor.nullifierRegistry();
      const actualAccountTLSParams = await wiseRegistrationProcessor.accountTLSParams();
      const actualOffRamperTLSParams = await wiseRegistrationProcessor.offRamperTLSParams();
      const actualTimestampBuffer = await wiseRegistrationProcessor.timestampBuffer();

      expect(actualRamp).to.eq(wiseRamp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(actualAccountTLSParams.endpoint).to.eq(ACCOUNT_TLS_PARAMS[paymentProvider][network].endpoint);
      expect(actualAccountTLSParams.host).to.eq(ACCOUNT_TLS_PARAMS[paymentProvider][network].host);
      expect(actualAccountTLSParams.notary).to.eq(ACCOUNT_TLS_PARAMS[paymentProvider][network].notary);
      expect(actualOffRamperTLSParams.endpoint).to.eq(OFFRAMPER_TLS_PARAMS[paymentProvider][network].endpoint);
      expect(actualOffRamperTLSParams.host).to.eq(OFFRAMPER_TLS_PARAMS[paymentProvider][network].host);
      expect(actualOffRamperTLSParams.notary).to.eq(OFFRAMPER_TLS_PARAMS[paymentProvider][network].notary);
      expect(actualTimestampBuffer).to.eq(0);
    });
  });

  describe("WiseSendProcessor", async () => {
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
      const registrationHasWritePermission = await nullifierRegistry.isWriter(wiseRegistrationProcessor.address);

      expect(sendHasWritePermission).to.be.true;
      expect(registrationHasWritePermission).to.be.true;
    });
  });
});
