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
  USDC,
  USDC_MINT_AMOUNT,
  USDC_RECIPIENT,
} from "../deployments/parameters";
import { addWritePermission, setNewOwner } from "../deployments/helpers";
import { PaymentProviders } from "../utils/types";
import { ADDRESS_ZERO } from "../utils/constants";

// Deployment Scripts
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const [ deployer ] = await hre.getUnnamedAccounts();
  const multiSig = MULTI_SIG[network] ? MULTI_SIG[network] : deployer;
  const paymentProvider = PaymentProviders.Venmo;

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

  const poseidon = await deploy("Poseidon3", {
    from: deployer,
    contract: {
      abi: circom.poseidonContract.generateABI(3),
      bytecode: circom.poseidonContract.createCode(3),
    }
  });
  console.log("Poseidon3 deployed at", poseidon.address);

  const ramp = await deploy("Ramp", {
    from: deployer,
    args: [
      deployer,
      usdcAddress,
      poseidon.address,
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
  console.log("Ramp deployed at", ramp.address);

  const keyHashAdapter = await deploy("VenmoManagedKeyHashAdapter", {
    contract: "ManagedKeyHashAdapter",
    from: deployer,
    args: [SERVER_KEY_HASH[paymentProvider][0]],
  });
  console.log("KeyHashAdapter deployed at", keyHashAdapter.address);

  const nullifierRegistry = await deploy("NullifierRegistry", {
    from: deployer,
    args: [],
  });
  console.log("Nullifier deployed at", nullifierRegistry.address);

  const registrationProcessor = await deploy("VenmoRegistrationProcessor", {
    from: deployer,
    args: [ramp.address, keyHashAdapter.address, nullifierRegistry.address, FROM_EMAIL[paymentProvider]],
  });
  console.log("RegistrationProcessor deployed at", registrationProcessor.address);

  const sendProcessor = await deploy("VenmoSendProcessor", {
    from: deployer,
    args: [ramp.address, keyHashAdapter.address, nullifierRegistry.address, FROM_EMAIL[paymentProvider]],
  });
  console.log("SendProcessor deployed at", sendProcessor.address);
  console.log("Processors deployed...");

  const rampContract = await ethers.getContractAt("Ramp", ramp.address);
  if ((await rampContract.registrationProcessor()) == ADDRESS_ZERO) {
    await rampContract.initialize(
      registrationProcessor.address,
      sendProcessor.address
    );
  
    console.log("Ramp initialized...");
  }

  const nullifierRegistryContract = await ethers.getContractAt("NullifierRegistry", nullifierRegistry.address);
  await addWritePermission(hre, nullifierRegistryContract, sendProcessor.address);

  console.log("NullifierRegistry permissions added...");
  
  if (network == "goerli") {
    const usdcContract = await ethers.getContractAt("USDCMock", usdcAddress);
    await usdcContract.transfer(USDC_RECIPIENT, USDC_MINT_AMOUNT);
  }

  console.log("Transferring ownership of contracts...");
  await setNewOwner(hre, rampContract, multiSig);
  await setNewOwner(
    hre,
    await ethers.getContractAt("VenmoRegistrationProcessor", registrationProcessor.address),
    multiSig
  );
  await setNewOwner(
    hre,
    await ethers.getContractAt("VenmoSendProcessor", sendProcessor.address),
    multiSig
  );
  await setNewOwner(hre, nullifierRegistryContract, multiSig);
  await setNewOwner(
    hre,
    await ethers.getContractAt("ManagedKeyHashAdapter", keyHashAdapter.address),
    multiSig
  );

  console.log("Deploy finished...");
};

export default func;
