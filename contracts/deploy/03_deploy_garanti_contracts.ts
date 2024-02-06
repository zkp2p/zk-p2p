import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const circom = require("circomlibjs");
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
} from "../deployments/parameters";
import { addWritePermission, getDeployedContractAddress, setNewOwner } from "../deployments/helpers";
import { PaymentProviders } from "../utils/types";
import { ZERO } from "../utils/constants";

// Deployment Scripts
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const [ deployer ] = await hre.getUnnamedAccounts();
  const multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer;
  const paymentProvider = PaymentProviders.Garanti;

  let usdcAddress = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

  const garantiRamp = await deploy("GarantiRamp", {
    from: deployer,
    args: [
      deployer,
      usdcAddress,
      MIN_DEPOSIT_AMOUNT[paymentProvider][network],
      MAX_ONRAMP_AMOUNT[paymentProvider][network],
      INTENT_EXPIRATION_PERIOD[paymentProvider][network],
      ONRAMP_COOL_DOWN_PERIOD[paymentProvider][network],
      SUSTAINABILITY_FEE[paymentProvider][network],
      SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network] != ""
        ? SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network]
        : deployer,
    ],
    log: true
  });
  console.log("GarantiRamp deployed at", garantiRamp.address);

  const keyHashAdapter = await deploy("GarantiManagedKeyHashAdapter", {
    contract: "ManagedKeyHashAdapterV2",
    from: deployer,
    args: [SERVER_KEY_HASH[paymentProvider]],
    log: true
  });
  console.log("KeyHashAdapter deployed at", keyHashAdapter.address);

  const nullifierRegistryContract = await ethers.getContractAt(
    "NullifierRegistry",
    getDeployedContractAddress(network, "NullifierRegistry")
  );

  const bodyHashVerifierDeploy = await deploy(
    "GarantiBodyHashVerifier",
    {
      from: deployer,
      args: [],
      log: true,
      contract: "contracts/verifiers/garanti_body_suffix_hasher_verifier.sol:Groth16Verifier"
    }
  );

  const registrationProcessor = await deploy("GarantiRegistrationProcessor", {
    from: deployer,
    args: [
      garantiRamp.address,
      keyHashAdapter.address,
      nullifierRegistryContract.address,
      bodyHashVerifierDeploy.address,
      FROM_EMAIL[paymentProvider],
      ZERO
    ],
    log: true
  });
  console.log("RegistrationProcessor deployed at", registrationProcessor.address);

  const sendProcessor = await deploy("GarantiSendProcessor", {
    from: deployer,
    args: [
      getDeployedContractAddress(network, "GarantiRamp"),
      keyHashAdapter.address,
      nullifierRegistryContract.address,
      bodyHashVerifierDeploy.address,
      FROM_EMAIL[paymentProvider],
      TIMESTAMP_BUFFER[paymentProvider]
    ],
    log: true
  });
  console.log("SendProcessor deployed at ", sendProcessor.address);
  console.log("Processors deployed...");

  const garantiRampContract = await ethers.getContractAt("GarantiRamp", garantiRamp.address);
  if (!(await garantiRampContract.isInitialized())) {
    await garantiRampContract.initialize(
      registrationProcessor.address,
      sendProcessor.address
    );
  
    console.log("GarantiRamp initialized...");
  }

  await addWritePermission(hre, nullifierRegistryContract, sendProcessor.address);
  await addWritePermission(hre, nullifierRegistryContract, registrationProcessor.address);
  console.log("NullifierRegistry permissions added...");

  console.log("Transferring ownership of contracts...");
  await setNewOwner(hre, garantiRampContract, multiSig);
  await setNewOwner(
    hre,
    await ethers.getContractAt("GarantiRegistrationProcessor", registrationProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("GarantiSendProcessor", sendProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("ManagedKeyHashAdapterV2", keyHashAdapter.address),
    multiSig
  );

  console.log("Deploy finished...");
};

func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> => {
  const network = hre.network.name;
  if (network == "base") {
    try { getDeployedContractAddress(hre.network.name, "GarantiRamp") } catch (e) {return false;}
    return true;
  }
  return false;
};

export default func;
