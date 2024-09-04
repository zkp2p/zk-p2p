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
  const paymentProvider = PaymentProviders.Revolut;

  let usdcAddress = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

  const revolutRamp = await deploy("RevolutRamp", {
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
  const revolutAccountRegistry = await deploy("RevolutAccountRegistry", {
    from: deployer,
    args: [deployer],
    log: true
  });
  console.log("RevolutRamp deployed at", revolutRamp.address);

  const nullifierRegistryContract = await ethers.getContractAt(
    "NullifierRegistry",
    getDeployedContractAddress(network, "NullifierRegistry")
  );

  const accountRegistrationProcessor = await deploy("RevolutAccountRegistrationProcessor", {
    from: deployer,
    args: [
      revolutAccountRegistry.address,
      ACCOUNT_TLS_PARAMS[paymentProvider][network].verifierSigningKey,
      ACCOUNT_TLS_PARAMS[paymentProvider][network].notaryKeyHash,
      nullifierRegistryContract.address,
      ZERO,
      ACCOUNT_TLS_PARAMS[paymentProvider][network].endpoint,
      ACCOUNT_TLS_PARAMS[paymentProvider][network].host
    ],
    log: true
  });
  console.log("AccountRegistrationProcessor deployed at", accountRegistrationProcessor.address);

  const sendProcessor = await deploy("RevolutSendProcessor", {
    from: deployer,
    args: [
      revolutRamp.address,
      nullifierRegistryContract.address,
      TIMESTAMP_BUFFER[paymentProvider],
      SEND_TLS_PARAMS[paymentProvider][network].endpoint,
      SEND_TLS_PARAMS[paymentProvider][network].host
    ],
    log: true
  });
  console.log("SendProcessor deployed at ", sendProcessor.address);
  console.log("Processors deployed...");

  const revolutRampContract = await ethers.getContractAt("RevolutRamp", revolutRamp.address);
  if (!(await revolutRampContract.isInitialized())) {
    await revolutRampContract.initialize(
      revolutAccountRegistry.address,
      sendProcessor.address
    );
  
    console.log("RevolutRamp initialized...");
  }

  const revolutAccountRegistryContract = await ethers.getContractAt("RevolutAccountRegistry", revolutAccountRegistry.address);
  if (!(await revolutAccountRegistryContract.isInitialized())) {
    await revolutAccountRegistryContract.initialize(
      accountRegistrationProcessor.address
    );
  
    console.log("RevolutAccountRegistry initialized...");
  }

  await addWritePermission(hre, nullifierRegistryContract, sendProcessor.address);
  await addWritePermission(hre, nullifierRegistryContract, accountRegistrationProcessor.address);
  console.log("NullifierRegistry permissions added...");

  console.log("Transferring ownership of contracts...");
  await setNewOwner(hre, revolutRampContract, multiSig);
  await setNewOwner(hre, revolutAccountRegistryContract, multiSig);
  await setNewOwner(
    hre,
    await ethers.getContractAt("RevolutSendProcessor", sendProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("RevolutAccountRegistrationProcessor", accountRegistrationProcessor.address),
    multiSig
  );


  console.log("Deploy finished...");
};

func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> => {
  // const network = hre.network.name;
  // if (network != "localhost") {
  //   try { getDeployedContractAddress(hre.network.name, "RevolutRamp") } catch (e) {return false;}
  //   return true;
  // }
  return false;
};

export default func;
