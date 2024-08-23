import "module-alias/register";

import { deployments, ethers } from "hardhat";

import {
  NullifierRegistry,
  DomainExchange,
  TransferDomainProcessor,
  ManagedKeyHashAdapterV2,
  VerifyDomainProcessor,
  ClaimVerifier,
  VerifiedDomainRegistry
} from "../../utils/contracts"
import {
  NullifierRegistry__factory,
  DomainExchange__factory,
  TransferDomainProcessor__factory,
  ManagedKeyHashAdapterV2__factory,
  VerifyDomainProcessor__factory,
  ClaimVerifier__factory,
  VerifiedDomainRegistry__factory
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
  FEE_PERCENTAGE,
  FEE_RECIPIENT,
  MULTI_SIG,
  BID_SETTLEMENT_PERIOD,
  BID_REFUND_PERIOD,
  USDC,
  SERVER_KEY_HASH,
  DOMAIN_EXPIRY_BUFFER,
  VERIFY_DOMAIN_PROVIDER_HASHES,
} from "../../deployments/parameters";

const expect = getWaffleExpect();

describe("Domain System Deploy", () => {
  let deployer: Account;
  let multiSig: Address;

  let nullifierRegistry: NullifierRegistry;
  let domainExchange: DomainExchange;
  let transferDomainProcessor: TransferDomainProcessor;
  let verifiedDomainRegistry: VerifiedDomainRegistry;
  let keyHashAdapter: ManagedKeyHashAdapterV2;
  let verifyDomainProcessor: VerifyDomainProcessor;
  let claimVerifier: ClaimVerifier;

  const network: string = deployments.getNetworkName();

  function getDeployedContractAddress(network: string, contractName: string): string {
    return require(`../../deployments/${network}/${contractName}.json`).address;
  }

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer.address;

    const nullifierRegistryAddress = await getDeployedContractAddress(network, "NullifierRegistry");
    nullifierRegistry = new NullifierRegistry__factory(deployer.wallet).attach(nullifierRegistryAddress);

    const domainExchangeAddress = await getDeployedContractAddress(network, "DomainExchange");
    domainExchange = new DomainExchange__factory(deployer.wallet).attach(domainExchangeAddress);

    const transferDomainProcessorAddress = await getDeployedContractAddress(network, "TransferDomainProcessor");
    transferDomainProcessor = new TransferDomainProcessor__factory(deployer.wallet).attach(transferDomainProcessorAddress);

    const keyHashAdapterAddress = await getDeployedContractAddress(network, "NamecheapManagedKeyHashAdapter");
    keyHashAdapter = new ManagedKeyHashAdapterV2__factory(deployer.wallet).attach(keyHashAdapterAddress);

    const claimVerifierAddress = await getDeployedContractAddress(network, "ClaimVerifier");
    claimVerifier = new ClaimVerifier__factory(deployer.wallet).attach(claimVerifierAddress);

    const verifiedDomainRegistryAddress = await getDeployedContractAddress(network, "VerifiedDomainRegistry");
    verifiedDomainRegistry = new VerifiedDomainRegistry__factory(deployer.wallet).attach(verifiedDomainRegistryAddress);

    const verifyDomainProcessorAddress = await getDeployedContractAddress(network, "VerifyDomainProcessor");
    verifyDomainProcessor = new VerifyDomainProcessor__factory(
      {
        "contracts/external/ClaimVerifier.sol:ClaimVerifier": claimVerifier.address,
      },
      deployer.wallet
    ).attach(verifyDomainProcessorAddress);
  });

  describe("DomainExchange", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await domainExchange.owner();
      const actualFeeRecipient = await domainExchange.feeRecipient();
      const actualFee = await domainExchange.fee();
      const actualBidSettlementPeriod = await domainExchange.bidSettlementPeriod();
      const actualBidRefundPeriod = await domainExchange.bidRefundPeriod();
      const actualTransferDomainProcessor = await domainExchange.transferDomainProcessor();
      const actualVerifyDomainProcessor = await domainExchange.verifyDomainProcessor();
      const actualVerifiedDomainRegistry = await domainExchange.verifiedDomainRegistry();
      const isInitialized = await domainExchange.isInitialized();
      const isEnabled = await domainExchange.isEnabled();

      expect(actualOwner).to.eq(multiSig);
      expect(actualFeeRecipient).to.eq(FEE_RECIPIENT[network]);
      expect(actualFee).to.eq(FEE_PERCENTAGE[network]);
      expect(actualBidSettlementPeriod).to.eq(BID_SETTLEMENT_PERIOD[network]);
      expect(actualBidRefundPeriod).to.eq(BID_REFUND_PERIOD[network]);
      expect(actualTransferDomainProcessor).to.eq(transferDomainProcessor.address);
      expect(actualVerifyDomainProcessor).to.eq(verifyDomainProcessor.address);
      expect(actualVerifiedDomainRegistry).to.eq(verifiedDomainRegistry.address);
      expect(isInitialized).to.be.true;
      expect(isEnabled).to.be.false;
    });
  });

  describe("TransferDomainProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await transferDomainProcessor.owner();
      const actualExchange = await transferDomainProcessor.exchange();
      const actualMailServerKeyHashAdapter = await transferDomainProcessor.mailServerKeyHashAdapter();
      const actualNullifierRegistry = await transferDomainProcessor.nullifierRegistry();

      expect(actualOwner).to.eq(multiSig);
      expect(actualExchange).to.eq(domainExchange.address);
      expect(actualMailServerKeyHashAdapter).to.eq(keyHashAdapter.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);
    });
  });

  describe("VerifyDomainProcessor", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await verifyDomainProcessor.owner();
      const actualRegistry = await verifyDomainProcessor.registry();
      const actualNullifierRegistry = await verifyDomainProcessor.nullifierRegistry();

      expect(actualOwner).to.eq(multiSig);
      expect(actualRegistry).to.eq(verifiedDomainRegistry.address);
      expect(actualNullifierRegistry).to.eq(nullifierRegistry.address);

      // Verify provider hashes
      const providerHashes = await verifyDomainProcessor.getProviderHashes();
      // Ensure each provider hash is correct
      for (let i = 0; i < providerHashes.length; i++) {
        expect(providerHashes[i]).to.eq(VERIFY_DOMAIN_PROVIDER_HASHES[i]);
      }
    });
  });

  describe("VerifiedDomainRegistry", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await verifiedDomainRegistry.owner();
      const actualDomainExpiryBuffer = await verifiedDomainRegistry.domainExpiryBuffer();

      expect(actualOwner).to.eq(multiSig);
      expect(actualDomainExpiryBuffer).to.eq(DOMAIN_EXPIRY_BUFFER[network]);
    });
  });

  describe("NullifierRegistry", async () => {
    it("should have the correct parameters set", async () => {
      const actualOwner = await nullifierRegistry.owner();
      const verifyHasWritePermission = await nullifierRegistry.isWriter(verifyDomainProcessor.address);
      const xferHasWritePermission = await nullifierRegistry.isWriter(transferDomainProcessor.address);

      expect(actualOwner).to.eq(multiSig);
      expect(verifyHasWritePermission).to.be.true;
      expect(xferHasWritePermission).to.be.true;
    });
  });

  describe("ManagedKeyHashAdapter", async () => {
    it("should have the correct owner set", async () => {
      const actualOwner = await keyHashAdapter.owner();
      const isMailServerKeyHash = await keyHashAdapter.isMailServerKeyHash(SERVER_KEY_HASH["namecheap"][0]);

      expect(actualOwner).to.eq(multiSig);
      expect(isMailServerKeyHash).to.be.true;
    });
  });
});