import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ONE_DAY_IN_SECONDS, THREE_MINUTES_IN_SECONDS } from "@utils/constants";

const circom = require("circomlibjs");

import { ether, usdc } from "../utils/common/units";

const SERVER_KEY_HASH = "0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";

const FROM_EMAIL = "venmo@venmo.com";

const MIN_DEPOSIT_AMOUNT = {
  "localhost": usdc(20),
  "goerli": usdc(20),
};
const MAX_ONRAMP_AMOUNT = {
  "localhost": usdc(999),
  "goerli": usdc(999),
};
const INTENT_EXPIRATION_PERIOD = {
  "localhost": ONE_DAY_IN_SECONDS,
  "goerli": ONE_DAY_IN_SECONDS,
};
const ONRAMP_COOL_DOWN_PERIOD = {
  "localhost": THREE_MINUTES_IN_SECONDS,
  "goerli": ONE_DAY_IN_SECONDS,
};
const SUSTAINABILITY_FEE = {
  "localhost": ether(.001),
  "goerli": ether(.001),
};
const SUSTAINABILITY_FEE_RECIPIENT = {
  "localhost": "",
  "goerli": "",
};
const USDC = {};
const USDC_MINT_AMOUNT = usdc(1000000);
const USDC_RECIPIENT = "0x1d2033DC6720e3eCC14aBB8C2349C7ED77E831ad";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments
  const network = hre.deployments.getNetworkName();

  const [ deployer ] = await hre.getUnnamedAccounts();
  
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

  const poseidon = await deploy("Poseidon", {
    from: deployer,
    contract: {
      abi: circom.poseidonContract.generateABI(3),
      bytecode: circom.poseidonContract.createCode(3),
    }
  });
  console.log("Poseidon deployed...");

  const ramp = await deploy("Ramp", {
    from: deployer,
    args: [
      deployer,
      usdcAddress,
      poseidon.address,
      MIN_DEPOSIT_AMOUNT[network],
      MAX_ONRAMP_AMOUNT[network],
      INTENT_EXPIRATION_PERIOD[network],
      ONRAMP_COOL_DOWN_PERIOD[network],
      SUSTAINABILITY_FEE[network],
      SUSTAINABILITY_FEE_RECIPIENT[network] != "" ? SUSTAINABILITY_FEE_RECIPIENT[network] : deployer,
    ],
  });
  console.log("Ramp deployed...");

  const keyHashAdapter = await deploy("ManagedKeyHashAdapter", {
    from: deployer,
    args: [SERVER_KEY_HASH],
  });

  const nullifierRegistry = await deploy("NullifierRegistry", {
    from: deployer,
    args: [],
  });

  const registrationProcessor = await deploy("VenmoRegistrationProcessor", {
    from: deployer,
    args: [ramp.address, keyHashAdapter.address, nullifierRegistry.address, FROM_EMAIL],
  });

  const sendProcessor = await deploy("VenmoSendProcessor", {
    from: deployer,
    args: [ramp.address, keyHashAdapter.address, nullifierRegistry.address, FROM_EMAIL],
  });
  console.log("Processors deployed...");

  const rampContract = await ethers.getContractAt("Ramp", ramp.address);
  await rampContract.initialize(
    registrationProcessor.address,
    sendProcessor.address
  );

  console.log("Ramp initialized...");

  const nullifierRegistryContract = await ethers.getContractAt("NullifierRegistry", nullifierRegistry.address);
  await nullifierRegistryContract.addWritePermission(sendProcessor.address);

  console.log("NullifierRegistry permissions added...");
  
  if (network == "goerli") {
    const usdcContract = await ethers.getContractAt("USDCMock", usdcAddress);
    await usdcContract.transfer(USDC_RECIPIENT, USDC_MINT_AMOUNT);
  }

  console.log("Deploy finished...");
};

export default func;
