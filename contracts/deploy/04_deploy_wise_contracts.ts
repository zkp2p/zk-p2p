import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const circom = require("circomlibjs");
import {
  ACCOUNT_TLS_PARAMS,
  INTENT_EXPIRATION_PERIOD,
  MAX_ONRAMP_AMOUNT,
  MIN_DEPOSIT_AMOUNT,
  MULTI_SIG,
  OFFRAMPER_TLS_PARAMS,
  ONRAMP_COOL_DOWN_PERIOD,
  SEND_TLS_PARAMS,
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
  const paymentProvider = PaymentProviders.Wise;

  let usdcAddress = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

  const wiseRamp = await deploy("WiseRamp", {
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
  const wiseAccountRegistry = await deploy("WiseAccountRegistry", {
    from: deployer,
    args: [deployer],
    log: true
  });
  console.log("WiseRamp deployed at", wiseRamp.address);

  const nullifierRegistryContract = await ethers.getContractAt(
    "NullifierRegistry",
    getDeployedContractAddress(network, "NullifierRegistry")
  );

  const accountRegistrationProcessor = await deploy("WiseAccountRegistrationProcessor", {
    from: deployer,
    args: [
      wiseAccountRegistry.address,
      ACCOUNT_TLS_PARAMS[paymentProvider][network].verifierSigningKey,
      nullifierRegistryContract.address,
      ZERO,
      ACCOUNT_TLS_PARAMS[paymentProvider][network].endpoint,
      ACCOUNT_TLS_PARAMS[paymentProvider][network].host
    ],
    log: true
  });
  console.log("AccountRegistrationProcessor deployed at", accountRegistrationProcessor.address);

  const offRamperRegistrationProcessor = await deploy("WiseOffRamperRegistrationProcessor", {
    from: deployer,
    args: [
      wiseAccountRegistry.address,
      OFFRAMPER_TLS_PARAMS[paymentProvider][network].verifierSigningKey,
      nullifierRegistryContract.address,
      ZERO,
      OFFRAMPER_TLS_PARAMS[paymentProvider][network].endpoint,
      OFFRAMPER_TLS_PARAMS[paymentProvider][network].host,
    ],
    log: true
  });
  console.log("AccountRegistrationProcessor deployed at", offRamperRegistrationProcessor.address);

  const sendProcessor = await deploy("WiseSendProcessor", {
    from: deployer,
    args: [
      wiseRamp.address,
      nullifierRegistryContract.address,
      TIMESTAMP_BUFFER[paymentProvider],
      SEND_TLS_PARAMS[paymentProvider][network].endpoint,
      SEND_TLS_PARAMS[paymentProvider][network].host
    ],
    log: true
  });
  console.log("SendProcessor deployed at ", sendProcessor.address);
  console.log("Processors deployed...");

  const wiseRampContract = await ethers.getContractAt("WiseRamp", wiseRamp.address);
  if (!(await wiseRampContract.isInitialized())) {
    await wiseRampContract.initialize(
      wiseAccountRegistry.address,
      sendProcessor.address
    );
  
    console.log("WiseRamp initialized...");
  }

  const wiseAccountRegistryContract = await ethers.getContractAt("WiseAccountRegistry", wiseAccountRegistry.address);
  if (!(await wiseAccountRegistryContract.isInitialized())) {
    await wiseAccountRegistryContract.initialize(
      accountRegistrationProcessor.address,
      offRamperRegistrationProcessor.address
    );
  
    console.log("WiseAccountRegistry initialized...");
  }

  await addWritePermission(hre, nullifierRegistryContract, sendProcessor.address);
  await addWritePermission(hre, nullifierRegistryContract, accountRegistrationProcessor.address);
  await addWritePermission(hre, nullifierRegistryContract, offRamperRegistrationProcessor.address);
  console.log("NullifierRegistry permissions added...");

  console.log("Transferring ownership of contracts...");
  await setNewOwner(hre, wiseRampContract, multiSig);
  await setNewOwner(hre, wiseAccountRegistryContract, multiSig);
  await setNewOwner(
    hre,
    await ethers.getContractAt("WiseAccountRegistrationProcessor", accountRegistrationProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("WiseOffRamperRegistrationProcessor", offRamperRegistrationProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("WiseSendProcessor", sendProcessor.address),
    multiSig
  );

  console.log("Deploy finished...");
};

func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> => {
  const network = hre.network.name;
  if (network != "localhost") {
    try { getDeployedContractAddress(hre.network.name, "WiseRamp") } catch (e) {return false;}
    return true;
  }
  return false;
};

export default func;
