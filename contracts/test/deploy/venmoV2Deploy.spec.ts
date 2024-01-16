import "module-alias/register";

import { deployments, ethers } from "hardhat";

import {
  ManagedKeyHashAdapterV2,
  NullifierRegistry,
  VenmoRampV2,
  VenmoRegistrationProcessorV2,
  VenmoSendProcessorV2,
} from "../../utils/contracts"
import {
  ManagedKeyHashAdapterV2__factory,
  NullifierRegistry__factory,
  VenmoRampV2__factory,
  VenmoRegistrationProcessorV2__factory,
  VenmoSendProcessorV2__factory,
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

const paymentProvider = PaymentProviders.Venmo;

describe("VenmoV2 Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let ramp: VenmoRampV2;
  let venmoRegistrationProcessor: VenmoRegistrationProcessorV2;
  let venmoSendProcessor: VenmoSendProcessorV2;
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

    const rampAddress  = await getDeployedContractAddress(network, "VenmoRampV2");
    ramp = new VenmoRampV2__factory(deployer.wallet).attach(rampAddress);

    const venmoRegistrationProcessorAddress  = await getDeployedContractAddress(network, "VenmoRegistrationProcessorV2");
    venmoRegistrationProcessor = new VenmoRegistrationProcessorV2__factory(deployer.wallet).attach(venmoRegistrationProcessorAddress);

    const venmoSendProcessorAddress  = await getDeployedContractAddress(network, "VenmoSendProcessorV2");
    venmoSendProcessor = new VenmoSendProcessorV2__factory(deployer.wallet).attach(venmoSendProcessorAddress);

    const nullifierRegistryAddress  = await getDeployedContractAddress(network, "NullifierRegistry");
    nullifierRegistry = new NullifierRegistry__factory(deployer.wallet).attach(nullifierRegistryAddress);

    const keyHashAdapterAddress  = await getDeployedContractAddress(network, "VenmoManagedKeyHashAdapterV2");
    keyHashAdapter = new ManagedKeyHashAdapterV2__factory(deployer.wallet).attach(keyHashAdapterAddress);
  });

  describe("VenmoRampV2", async () => {
    it("should have the correct processors, usdc, and poseidon set", async () => {
      const actualRegistrationProcessor = await ramp.registrationProcessor();
      const actualSendProcessor = await ramp.sendProcessor();
      const actualPoseidon = await ramp.poseidon();
      const actualUsdc = await ramp.usdc();

      const expectedUsdc = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

      expect(actualRegistrationProcessor).to.eq(venmoRegistrationProcessor.address);
      expect(actualSendProcessor).to.eq(venmoSendProcessor.address);
      expect(actualPoseidon).to.eq(await getDeployedContractAddress(network, "Poseidon3"));
      expect(actualUsdc).to.eq(expectedUsdc);
    });

    it("should have the correct limitations set", async () => {
      const actualCoolDownPeriod = await ramp.onRampCooldownPeriod();
      const actualMinDepositAmount = await ramp.minDepositAmount();
      const actualMaxOnRampAmount = await ramp.maxOnRampAmount();
      const actualIntentExpirationPeriod = await ramp.intentExpirationPeriod();

      expect(actualCoolDownPeriod).to.eq(ONRAMP_COOL_DOWN_PERIOD[paymentProvider][network]);
      expect(actualMinDepositAmount).to.eq(MIN_DEPOSIT_AMOUNT[paymentProvider][network]);
      expect(actualMaxOnRampAmount).to.eq(MAX_ONRAMP_AMOUNT[paymentProvider][network]);
      expect(actualIntentExpirationPeriod).to.eq(INTENT_EXPIRATION_PERIOD[paymentProvider][network]);
    });

    it("should correctly fee and ownership params", async () => {
      const actualSustainabilityFee = await ramp.sustainabilityFee();
      const actualSustainabilityFeeRecipient = await ramp.sustainabilityFeeRecipient();
      const actualOwner = await ramp.owner();

      const expectedSustainabilityFeeRecipient = SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network] != ""
        ? SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network]
        : deployer.address;

      expect(actualSustainabilityFee).to.eq(SUSTAINABILITY_FEE[paymentProvider][network]);
      expect(actualSustainabilityFeeRecipient).to.eq(expectedSustainabilityFeeRecipient);
      expect(actualOwner).to.eq(multiSig);
    });
  });

  describe("VenmoRegistrationProcessorV2", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await venmoRegistrationProcessor.ramp();
      const actualOwner = await venmoRegistrationProcessor.owner();
      const actualKeyHashAdapter = await venmoRegistrationProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await venmoRegistrationProcessor.nullifierRegistry();
      const actualEmailFromAddress = await venmoRegistrationProcessor.emailFromAddress();
      const actualTimestampBuffer = await venmoRegistrationProcessor.timestampBuffer();

      expect(actualRamp).to.eq(ramp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL[paymentProvider]));
      expect(actualTimestampBuffer).to.eq(0);
    });
  });

  describe("VenmoSendProcessorV2", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await venmoSendProcessor.ramp();
      const actualOwner = await venmoSendProcessor.owner();
      const actualKeyHashAdapter = await venmoSendProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await venmoSendProcessor.nullifierRegistry();
      const actualEmailFromAddress = await venmoSendProcessor.emailFromAddress();
      const actualTimestampBuffer = await venmoSendProcessor.timestampBuffer();

      expect(actualRamp).to.eq(ramp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL[paymentProvider]));
      expect(actualTimestampBuffer).to.eq(TIMESTAMP_BUFFER[paymentProvider]);
    });
  });

  describe("ManagedKeyHashAdapterV2", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await keyHashAdapter.owner();
      const isMailServerKeyHash = await keyHashAdapter.isMailServerKeyHash(SERVER_KEY_HASH[paymentProvider][0]);

      expect(actualOwner).to.eq(multiSig);
      expect(isMailServerKeyHash).to.be.true;
    });
  });

  describe("NullifierRegistry", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await nullifierRegistry.owner();
      const hasWritePermission = await nullifierRegistry.isWriter(venmoSendProcessor.address);

      expect(actualOwner).to.eq(multiSig);
      expect(hasWritePermission).to.be.true;
    });
  });
});
