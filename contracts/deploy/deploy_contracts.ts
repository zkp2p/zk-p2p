import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";

const circom = require("circomlibjs");

import { usdc } from "../utils/common/units";

const SERVER_KEY_HASH = "0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";

const FROM_EMAIL = "venmo@venmo.com".padEnd(21, "\0");

const CONVENIENCE_TIME_PERIOD = BigNumber.from(60);
const MIN_DEPOSIT_AMOUNT = usdc(20);
const USDC_MINT_AMOUNT = usdc(1000000);

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments

  const [ deployer ] = await hre.getUnnamedAccounts();
  console.log(deployer.address);
  const usdcToken = await deploy("USDCMock", {
    from: deployer,
    args: [USDC_MINT_AMOUNT, "USDC", "USDC"],
  });
  console.log("USDC deployed...");
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
      usdcToken.address,
      poseidon.address,
      MIN_DEPOSIT_AMOUNT,
      CONVENIENCE_TIME_PERIOD
    ],
  });
  console.log("Ramp deployed...");
  const keyHashAdapter = await deploy("ManagedKeyHashAdapter", {
    from: deployer,
    args: [SERVER_KEY_HASH],
  });

  const registrationProcessor = await deploy("VenmoRegistrationProcessor", {
    from: deployer,
    args: [ramp.address, keyHashAdapter.address, FROM_EMAIL],
  });

  const receiveProcessor = await deploy("VenmoReceiveProcessor", {
    from: deployer,
    args: [ramp.address, keyHashAdapter.address, FROM_EMAIL],
  });

  const sendProcessor = await deploy("VenmoSendProcessor", {
    from: deployer,
    args: [ramp.address, keyHashAdapter.address, FROM_EMAIL],
  });
  console.log("Processors deployed...");
  const rampContract = await ethers.getContractAt("Ramp", ramp.address);
  await rampContract.initialize(
    receiveProcessor.address,
    registrationProcessor.address,
    sendProcessor.address
  );

  const usdcContract = await ethers.getContractAt("USDCMock", usdcToken.address);
  await usdcContract.transfer("0x1d2033DC6720e3eCC14aBB8C2349C7ED77E831ad", USDC_MINT_AMOUNT);
  console.log("Deploy finished...");
};

export default func;
