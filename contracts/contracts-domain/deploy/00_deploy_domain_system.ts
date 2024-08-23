import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import {
  FROM_EMAIL,
  SERVER_KEY_HASH,
  ALLOWED_ADDRESSES,
  FEE_PERCENTAGE,
  FEE_RECIPIENT,
  MULTI_SIG,
  BID_SETTLEMENT_PERIOD,
  BID_REFUND_PERIOD,
  USDC,
  USDC_MINT_AMOUNT,
  USDC_RECIPIENT,
  VERIFY_DOMAIN_PROVIDER_HASHES,
  VERIFY_DOMAIN_WITNESS,
  DOMAIN_EXPIRY_BUFFER
} from "../deployments/parameters";
import {
  addWitness,
  addWritePermission,
  getDeployedContractAddress,
  setNewOwner
} from "../deployments/helpers";
import { ZERO, ADDRESS_ZERO } from "../utils/constants";


// Deployment scripts
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const [deployer] = await hre.getUnnamedAccounts();
  const multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer;

  let usdcAddress;
  if (!USDC[network]) {
    const usdcToken = await deploy("USDCMock", {
      from: deployer,
      args: [USDC_MINT_AMOUNT, "USDC", "USDC"],
    });
    usdcAddress = usdcToken.address;
    console.log("USDC deployed...");
  } else {
    usdcAddress = USDC[network];
  }


  // Deploy DomainExchange
  const domainExchange = await deploy("DomainExchange", {
    from: deployer,
    args: [
      deployer,
      FEE_PERCENTAGE[network],
      FEE_RECIPIENT[network],
      BID_SETTLEMENT_PERIOD[network],
      BID_REFUND_PERIOD[network],
      ALLOWED_ADDRESSES[network],
    ],
  }, { log: true });
  console.log("DomainExchange deployed at", domainExchange.address);

  // Deploy KeyHashAdapter
  const keyHashAdapter = await deploy("NamecheapManagedKeyHashAdapter", {
    contract: "ManagedKeyHashAdapterV2",
    from: deployer,
    args: [SERVER_KEY_HASH["namecheap"]],
    log: true
  }, { log: true });
  console.log("KeyHashAdapter deployed at", keyHashAdapter.address);

  // Deploy NullifierRegistry
  const nullifierRegistry = await deploy("NullifierRegistry", {
    from: deployer,
    args: [],
  }, { log: true });
  console.log("Nullifier deployed at", nullifierRegistry.address);

  // Deploy TransferDomainProcessor
  const transferDomainProcessor = await deploy("TransferDomainProcessor", {
    from: deployer,
    args: [
      domainExchange.address,
      keyHashAdapter.address,
      nullifierRegistry.address,
      FROM_EMAIL["namecheap"],
      ZERO
    ],
    log: true
  });
  console.log("TransferDomainProcessor deployed at", transferDomainProcessor.address);

  // Deploy ClaimVerifier
  const claimVerifier = await deploy("ClaimVerifier", {
    from: deployer,
    args: [],
  }, { log: true });
  console.log("ClaimVerifier deployed at", claimVerifier.address);

  // Deploy VerifiedDomainRegistry
  const verifiedDomainRegistry = await deploy("VerifiedDomainRegistry", {
    from: deployer,
    args: [DOMAIN_EXPIRY_BUFFER[network]],
  }, { log: true });
  console.log("VerifiedDomainRegistry deployed at", verifiedDomainRegistry.address);

  // Deploy VerifyDomainProcessor
  const verifyDomainProcessor = await deploy("VerifyDomainProcessor", {
    from: deployer,
    libraries: {
      ClaimVerifier: claimVerifier.address,
    },
    args: [
      verifiedDomainRegistry.address,
      nullifierRegistry.address,
      VERIFY_DOMAIN_PROVIDER_HASHES
    ],
  }, { log: true });
  console.log("VerifyDomainProcessor deployed at", verifyDomainProcessor.address);
  console.log("processors deployed...");


  // Initialize VerifiedDomainRegistry
  const verifiedDomainRegistryContract = await ethers.getContractAt("VerifiedDomainRegistry", verifiedDomainRegistry.address);
  if (!(await verifiedDomainRegistryContract.isInitialized())) {
    await hre.deployments.rawTx(
      {
        from: deployer,
        to: verifiedDomainRegistryContract.address,
        data: verifiedDomainRegistryContract.interface.encodeFunctionData(
          "initialize",
          [
            verifyDomainProcessor.address
          ]
        )
      }
    )
  }

  // Initialize DomainExchange
  const exchangeContract = await ethers.getContractAt("DomainExchange", domainExchange.address)
  if (!(await exchangeContract.isInitialized())) {
    await hre.deployments.rawTx(
      {
        from: deployer,
        to: exchangeContract.address,
        data: exchangeContract.interface.encodeFunctionData(
          "initialize",
          [
            verifyDomainProcessor.address,
            transferDomainProcessor.address,
            verifiedDomainRegistry.address
          ]
        )
      }
    )
  }

  // Disable allow list; Domain trading has no restrictions on who can sell
  const isEnabled = await exchangeContract.isEnabled();
  if (isEnabled) {
    await hre.deployments.rawTx(
      {
        from: deployer,
        to: exchangeContract.address,
        data: exchangeContract.interface.encodeFunctionData("disableAllowlist")
      }
    )
  }

  // Add NullifierRegistry permissions
  const nullifierRegistryContract = await ethers.getContractAt("NullifierRegistry", nullifierRegistry.address);
  await addWritePermission(hre, nullifierRegistryContract, transferDomainProcessor.address);
  await addWritePermission(hre, nullifierRegistryContract, verifyDomainProcessor.address);
  console.log("NullifierRegistry permissions added");

  if (network == "goerli") {
    const usdcContract = await ethers.getContractAt("USDCMock", usdcAddress);
    await usdcContract.transfer(USDC_RECIPIENT, USDC_MINT_AMOUNT);
  }

  // Add witnesses to VerifyDomainProcessor
  const verifyDomainProcessorContract = await ethers.getContractAt("VerifyDomainProcessor", verifyDomainProcessor.address);
  await addWitness(hre, verifyDomainProcessorContract, VERIFY_DOMAIN_WITNESS[network]);

  console.log("Transferring ownership of contracts...");
  await setNewOwner(hre, domainExchange.address, multiSig);
  await setNewOwner(hre, keyHashAdapter.address, multiSig);
  await setNewOwner(hre, nullifierRegistry.address, multiSig);
  await setNewOwner(hre, transferDomainProcessor.address, multiSig);
  await setNewOwner(hre, verifyDomainProcessor.address, multiSig);
  await setNewOwner(hre, verifiedDomainRegistry.address, multiSig);
  console.log("Ownership transferred");
}

func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> => {
  const network = hre.network.name;
  if (network != "localhost") {
    try { getDeployedContractAddress(hre.network.name, "Ramp") } catch (e) { return false; }
    return true;
  }
  return false;
};

export default func;
