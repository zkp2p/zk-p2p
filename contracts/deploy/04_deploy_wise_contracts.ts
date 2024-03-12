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
  console.log("WiseRamp deployed at", wiseRamp.address);

  const nullifierRegistryContract = await ethers.getContractAt(
    "NullifierRegistry",
    getDeployedContractAddress(network, "NullifierRegistry")
  );

  const registrationProcessor = await deploy("WiseRegistrationProcessor", {
    from: deployer,
    args: [
      wiseRamp.address,
      nullifierRegistryContract.address,
      ZERO,
      ACCOUNT_TLS_PARAMS[paymentProvider][network],
      OFFRAMPER_TLS_PARAMS[paymentProvider][network],
    ],
    log: true
  });
  console.log("RegistrationProcessor deployed at", registrationProcessor.address);

  const sendProcessor = await deploy("WiseSendProcessor", {
    from: deployer,
    args: [
      wiseRamp.address,
      nullifierRegistryContract.address,
      TIMESTAMP_BUFFER[paymentProvider]
    ],
    log: true
  });
  console.log("SendProcessor deployed at ", sendProcessor.address);
  console.log("Processors deployed...");

  const wiseRampContract = await ethers.getContractAt("WiseRamp", wiseRamp.address);
  if (!(await wiseRampContract.isInitialized())) {
    await wiseRampContract.initialize(
      registrationProcessor.address,
      sendProcessor.address
    );
  
    console.log("WiseRamp initialized...");
  }

  await addWritePermission(hre, nullifierRegistryContract, sendProcessor.address);
  await addWritePermission(hre, nullifierRegistryContract, registrationProcessor.address);
  console.log("NullifierRegistry permissions added...");

  console.log("Transferring ownership of contracts...");
  await setNewOwner(hre, wiseRampContract, multiSig);
  await setNewOwner(
    hre,
    await ethers.getContractAt("WiseRegistrationProcessor", registrationProcessor.address),
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
