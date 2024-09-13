import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

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
  const paymentProvider = PaymentProviders.Venmo;

  const usdcAddress = USDC[network] ? USDC[network] : getDeployedContractAddress(network, "USDCMock");

  const ramp = await deploy("VenmoRampV2", {
    from: deployer,
    args: [
      deployer,
      getDeployedContractAddress(network, "Ramp"),
      usdcAddress,
      getDeployedContractAddress(network, "Poseidon3"),
      MIN_DEPOSIT_AMOUNT[paymentProvider][network],
      MAX_ONRAMP_AMOUNT[paymentProvider][network],
      INTENT_EXPIRATION_PERIOD[paymentProvider][network],
      ONRAMP_COOL_DOWN_PERIOD[paymentProvider][network],
      SUSTAINABILITY_FEE[paymentProvider][network],
      SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network] != ""
        ? SUSTAINABILITY_FEE_RECIPIENT[paymentProvider][network] 
        : deployer,
    ],
  });
  console.log("VenmoRampV2 deployed at", ramp.address);

  const keyHashAdapterDeploy = await deploy("VenmoManagedKeyHashAdapterV2", {
    contract: "ManagedKeyHashAdapterV2",
    from: deployer,
    args: [SERVER_KEY_HASH[paymentProvider]],
  });
  console.log("VenmoV2KeyHashAdapter deployed at", keyHashAdapterDeploy.address);

  const nullifierRegistryContract = await ethers.getContractAt(
    "NullifierRegistry",
    getDeployedContractAddress(network, "NullifierRegistry")
  );

  const registrationProcessor = await deploy("VenmoRegistrationProcessorV2", {
    from: deployer,
    args: [
      ramp.address,
      keyHashAdapterDeploy.address,
      nullifierRegistryContract.address,
      FROM_EMAIL[paymentProvider],
      ZERO,
    ],
  });
  console.log("RegistrationProcessorV2 deployed at", registrationProcessor.address);

  const sendProcessor = await deploy("VenmoSendProcessorV2", {
    from: deployer,
    args: [
      ramp.address,
      keyHashAdapterDeploy.address,
      nullifierRegistryContract.address,
      FROM_EMAIL[paymentProvider],
      TIMESTAMP_BUFFER[paymentProvider],
    ],
  });
  console.log("SendProcessorV2 deployed at", sendProcessor.address);
  console.log("Processors deployed...");

  const rampContract = await ethers.getContractAt("VenmoRampV2", ramp.address);
  if (!(await rampContract.isInitialized())) {
    await rampContract.initialize(
      registrationProcessor.address,
      sendProcessor.address
    );
  
    console.log("VenmoRampV2 initialized...");
  }

  await addWritePermission(hre, nullifierRegistryContract, registrationProcessor.address);
  await addWritePermission(hre, nullifierRegistryContract, sendProcessor.address);

  console.log("NullifierRegistry permissions added...");

  console.log("Transferring ownership of contracts...");
  await setNewOwner(hre, rampContract, multiSig);
  await setNewOwner(
    hre,
    await ethers.getContractAt("VenmoRegistrationProcessorV2", registrationProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("VenmoSendProcessorV2", sendProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("ManagedKeyHashAdapterV2", keyHashAdapterDeploy.address),
    multiSig
  );

  console.log("Deploy finished...");
};

func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> => {
  const network = hre.network.name;
  if (network != "localhost") {
    try { getDeployedContractAddress(hre.network.name, "VenmoRampV2") } catch (e) {return false;}
    return true;
  }
  return false;
};

export default func;
