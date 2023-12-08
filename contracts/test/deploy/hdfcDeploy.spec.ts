import "module-alias/register";

import { deployments, ethers } from "hardhat";

import {
  ManagedKeyHashAdapterV2,
  NullifierRegistry,
  HDFCRamp,
  HDFCRegistrationProcessor,
  HDFCSendProcessor,
} from "../../utils/contracts"
import {
  ManagedKeyHashAdapterV2__factory,
  NullifierRegistry__factory,
  HDFCRamp__factory,
  HDFCRegistrationProcessor__factory,
  HDFCSendProcessor__factory,
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
  USDC,
} from "../../deployments/parameters";
import { PaymentProviders } from "../../utils/types"

const expect = getWaffleExpect();

const paymentProvider = PaymentProviders.HDFC;

describe("HDFC Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let hdfcRamp: HDFCRamp;
  let hdfcRegistrationProcessor: HDFCRegistrationProcessor;
  let hdfcSendProcessor: HDFCSendProcessor;
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

    const hdfcRampAddress  = await getDeployedContractAddress(network, "HDFCRamp");
    hdfcRamp = new HDFCRamp__factory(deployer.wallet).attach(hdfcRampAddress);

    const hdfcRegistrationProcessorAddress  = await getDeployedContractAddress(network, "HDFCRegistrationProcessor");
    hdfcRegistrationProcessor = new HDFCRegistrationProcessor__factory(deployer.wallet).attach(hdfcRegistrationProcessorAddress);

    const hdfcSendProcessorAddress  = await getDeployedContractAddress(network, "HDFCSendProcessor");
    hdfcSendProcessor = new HDFCSendProcessor__factory(deployer.wallet).attach(hdfcSendProcessorAddress);

    const nullifierRegistryAddress  = await getDeployedContractAddress(network, "NullifierRegistry");
    nullifierRegistry = new NullifierRegistry__factory(deployer.wallet).attach(nullifierRegistryAddress);

    const keyHashAdapterAddress  = await getDeployedContractAddress(network, "HDFCManagedKeyHashAdapter");
    keyHashAdapter = new ManagedKeyHashAdapterV2__factory(deployer.wallet).attach(keyHashAdapterAddress);
  });

  describe("HDFCRamp", async () => {
    it("should have the correct processors, usdc, and poseidon set", async () => {
      const actualRegistrationProcessor = await hdfcRamp.registrationProcessor();
      const actualSendProcessor = await hdfcRamp.sendProcessor();
      const actualUsdc = await hdfcRamp.usdc();
      const actualPoseidon3 = await hdfcRamp.poseidon3();
      const actualPoseidon6 = await hdfcRamp.poseidon6();

      const expectedUsdc = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

      expect(actualRegistrationProcessor).to.eq(hdfcRegistrationProcessor.address);
      expect(actualSendProcessor).to.eq(hdfcSendProcessor.address);
      expect(actualUsdc).to.eq(expectedUsdc);
      expect(actualPoseidon3).to.eq(await getDeployedContractAddress(network, "Poseidon3"));
      expect(actualPoseidon6).to.eq(await getDeployedContractAddress(network, "Poseidon6"));
    });

    it("should have the correct limitations set", async () => {
      const actualCoolDownPeriod = await hdfcRamp.onRampCooldownPeriod();
      const actualMinDepositAmount = await hdfcRamp.minDepositAmount();
      const actualMaxOnRampAmount = await hdfcRamp.maxOnRampAmount();
      const actualIntentExpirationPeriod = await hdfcRamp.intentExpirationPeriod();

      expect(actualCoolDownPeriod).to.eq(ONRAMP_COOL_DOWN_PERIOD[paymentProvider][network]);
      expect(actualMinDepositAmount).to.eq(MIN_DEPOSIT_AMOUNT[paymentProvider][network]);
      expect(actualMaxOnRampAmount).to.eq(MAX_ONRAMP_AMOUNT[paymentProvider][network]);
      expect(actualIntentExpirationPeriod).to.eq(INTENT_EXPIRATION_PERIOD[paymentProvider][network]);
    });

    it("should correctly fee and ownership params", async () => {
      const actualSustainabilityFee = await hdfcRamp.sustainabilityFee();
      const actualSustainabilityFeeRecipient = await hdfcRamp.sustainabilityFeeRecipient();
      const actualOwner = await hdfcRamp.owner();

      const expectedSustainabilityFeeRecipient = SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network] != ""
        ? SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network]
        : deployer.address;

      expect(actualSustainabilityFee).to.eq(SUSTAINABILITY_FEE[paymentProvider][network]);
      expect(actualSustainabilityFeeRecipient).to.eq(expectedSustainabilityFeeRecipient);
      expect(actualOwner).to.eq(multiSig);
    });
  });

  describe("HDFCRegistrationProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await hdfcRegistrationProcessor.ramp();
      const actualOwner = await hdfcRegistrationProcessor.owner();
      const actualKeyHashAdapter = await hdfcRegistrationProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await hdfcRegistrationProcessor.nullifierRegistry();
      const actualEmailFromAddress = await hdfcRegistrationProcessor.emailFromAddress();

      expect(actualRamp).to.eq(hdfcRamp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL[paymentProvider]));
    });
  });

  describe("HDFCSendProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await hdfcSendProcessor.ramp();
      const actualOwner = await hdfcSendProcessor.owner();
      const actualKeyHashAdapter = await hdfcSendProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await hdfcSendProcessor.nullifierRegistry();
      const actualEmailFromAddress = await hdfcSendProcessor.emailFromAddress();

      expect(actualRamp).to.eq(hdfcRamp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL[paymentProvider]));
    });
  });

  describe("ManagedKeyHashAdapterV2", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await keyHashAdapter.owner();
      const actualMailserverKeyHashes = await keyHashAdapter.getMailServerKeyHashes();

      expect(actualOwner).to.eq(multiSig);
      expect(actualMailserverKeyHashes).to.contain(SERVER_KEY_HASH[paymentProvider][0]);
      expect(actualMailserverKeyHashes).to.contain(SERVER_KEY_HASH[paymentProvider][1]);
    });
  });

  describe("NullifierRegistry", async () => {
    it("should have the correct parameters set", async () => {
      const hasWritePermission = await nullifierRegistry.isWriter(hdfcSendProcessor.address);

      expect(hasWritePermission).to.be.true;
    });
  });
});
