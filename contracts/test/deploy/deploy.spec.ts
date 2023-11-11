import "module-alias/register";

import { deployments, ethers } from "hardhat";

import {
  ManagedKeyHashAdapter,
  NullifierRegistry,
  Ramp,
  VenmoRegistrationProcessor,
  VenmoSendProcessor,
} from "../../utils/contracts"
import {
  ManagedKeyHashAdapter__factory,
  NullifierRegistry__factory,
  Ramp__factory,
  VenmoRegistrationProcessor__factory,
  VenmoSendProcessor__factory,
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
  USDC_MINT_AMOUNT,
  USDC_RECIPIENT,
} from "../../deployments/parameters";

const expect = getWaffleExpect();

describe("System Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let ramp: Ramp;
  let venmoRegistrationProcessor: VenmoRegistrationProcessor;
  let venmoSendProcessor: VenmoSendProcessor;
  let nullifierRegistry: NullifierRegistry;
  let keyHashAdapter: ManagedKeyHashAdapter;

  const network: string = deployments.getNetworkName();

  function getDeployedContractAddress(network: string, contractName: string): string {
    return require(`../../deployments/${network}/${contractName}.json`).address;
  }

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer;

    const rampAddress  = await getDeployedContractAddress(network, "Ramp");
    ramp = new Ramp__factory(deployer.wallet).attach(rampAddress);

    const venmoRegistrationProcessorAddress  = await getDeployedContractAddress(network, "VenmoRegistrationProcessor");
    venmoRegistrationProcessor = new VenmoRegistrationProcessor__factory(deployer.wallet).attach(venmoRegistrationProcessorAddress);

    const venmoSendProcessorAddress  = await getDeployedContractAddress(network, "VenmoSendProcessor");
    venmoSendProcessor = new VenmoSendProcessor__factory(deployer.wallet).attach(venmoSendProcessorAddress);

    const nullifierRegistryAddress  = await getDeployedContractAddress(network, "NullifierRegistry");
    nullifierRegistry = new NullifierRegistry__factory(deployer.wallet).attach(nullifierRegistryAddress);

    const keyHashAdapterAddress  = await getDeployedContractAddress(network, "ManagedKeyHashAdapter");
    keyHashAdapter = new ManagedKeyHashAdapter__factory(deployer.wallet).attach(keyHashAdapterAddress);
  });

  describe("Ramp", async () => {
    it("should have the correct processors, usdc, and poseidon set", async () => {
      const actualRegistrationProcessor = await ramp.registrationProcessor();
      const actualSendProcessor = await ramp.sendProcessor();
      const actualPoseidon = await ramp.poseidon();
      const actualUsdc = await ramp.usdc();

      const expectedUsdc = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

      expect(actualRegistrationProcessor).to.eq(venmoRegistrationProcessor.address);
      expect(actualSendProcessor).to.eq(venmoSendProcessor.address);
      expect(actualPoseidon).to.eq(await getDeployedContractAddress(network, "Poseidon"));
      expect(actualUsdc).to.eq(expectedUsdc);
    });

    it("should have the correct limitations set", async () => {
      const actualCoolDownPeriod = await ramp.onRampCooldownPeriod();
      const actualMinDepositAmount = await ramp.minDepositAmount();
      const actualMaxOnRampAmount = await ramp.maxOnRampAmount();
      const actualIntentExpirationPeriod = await ramp.intentExpirationPeriod();

      expect(actualCoolDownPeriod).to.eq(ONRAMP_COOL_DOWN_PERIOD[network]);
      expect(actualMinDepositAmount).to.eq(MIN_DEPOSIT_AMOUNT[network]);
      expect(actualMaxOnRampAmount).to.eq(MAX_ONRAMP_AMOUNT[network]);
      expect(actualIntentExpirationPeriod).to.eq(INTENT_EXPIRATION_PERIOD[network]);
    });

    it("should correctly fee and ownership params", async () => {
      const actualSustainabilityFee = await ramp.sustainabilityFee();
      const actualSustainabilityFeeRecipient = await ramp.sustainabilityFeeRecipient();
      const actualOwner = await ramp.owner();

      const expectedSustainabilityFeeRecipient = SUSTAINABILITY_FEE_RECIPIENT[network] != "" ?
        SUSTAINABILITY_FEE_RECIPIENT[network] : deployer.address;

      expect(actualSustainabilityFee).to.eq(SUSTAINABILITY_FEE[network]);
      expect(actualSustainabilityFeeRecipient).to.eq(expectedSustainabilityFeeRecipient);
      expect(actualOwner).to.eq(multiSig);
    });
  });

  describe("VenmoRegistrationProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await venmoRegistrationProcessor.ramp();
      const actualOwner = await venmoRegistrationProcessor.owner();
      const actualKeyHashAdapter = await venmoRegistrationProcessor.mailserverKeyHashAdapter();
      const actualNullifierRegistry = await venmoRegistrationProcessor.nullifierRegistry();
      const actualEmailFromAddress = await venmoRegistrationProcessor.emailFromAddress();

      expect(actualRamp).to.eq(ramp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL));
    });
  });

  describe("VenmoSendProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualRamp = await venmoSendProcessor.ramp();
      const actualOwner = await venmoSendProcessor.owner();
      const actualKeyHashAdapter = await venmoSendProcessor.mailserverKeyHashAdapter();
      const actualNullifierRegistry = await venmoSendProcessor.nullifierRegistry();
      const actualEmailFromAddress = await venmoSendProcessor.emailFromAddress();

      expect(actualRamp).to.eq(ramp.address);
      expect(actualOwner).to.eq(multiSig);
      expect(actualKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
      expect(ethers.utils.arrayify(actualEmailFromAddress)).to.deep.eq(ethers.utils.toUtf8Bytes(FROM_EMAIL));
    });
  });

  describe("ManagedKeyHashAdapter", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await keyHashAdapter.owner();
      const actualMailserverKeyHash = await keyHashAdapter.mailserverKeyHash();

      expect(actualOwner).to.eq(multiSig);
      expect(actualMailserverKeyHash).to.eq(SERVER_KEY_HASH);
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
