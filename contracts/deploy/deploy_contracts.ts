import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { usdc } from "../utils/common/units";

const SERVER_KEYS = [
  BigNumber.from("683441457792668103047675496834917209"),
  BigNumber.from("1011953822609495209329257792734700899"),
  BigNumber.from("1263501452160533074361275552572837806"),
  BigNumber.from("2083482795601873989011209904125056704"),
  BigNumber.from("642486996853901942772546774764252018"),
  BigNumber.from("1463330014555221455251438998802111943"),
  BigNumber.from("2411895850618892594706497264082911185"),
  BigNumber.from("520305634984671803945830034917965905"),
  BigNumber.from("47421696716332554"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0")
];

const FROM_EMAIL = "venmo@venmo.com".padEnd(35, "\0");

const CONVENIENCE_TIME_PERIOD = BigNumber.from(60);

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = await hre.deployments

  const [ deployer ] = await hre.getUnnamedAccounts();

  const registrationProcessor = await deploy("VenmoRegistrationProcessor", {
    from: deployer,
    args: [SERVER_KEYS, FROM_EMAIL],
  });

  const receiveProcessor = await deploy("VenmoReceiveProcessor", {
    from: deployer,
    args: [SERVER_KEYS, FROM_EMAIL],
  });

  const sendProcessor = await deploy("VenmoSendProcessor", {
    from: deployer,
    args: [SERVER_KEYS, FROM_EMAIL],
  });

  const usdcToken = await deploy("USDCMock", {
    from: deployer,
    args: [usdc(1000000), "USDC", "USDC"],
  });

  const ramp = await deploy("Ramp", {
    from: deployer,
    args: [
      deployer,
      usdcToken.address,
      receiveProcessor.address,
      registrationProcessor.address,
      sendProcessor.address,
      CONVENIENCE_TIME_PERIOD
    ],
  });
};

export default func;
