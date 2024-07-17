import "module-alias/register";
import { BigNumber } from "ethers";
import { ONE_DAY_IN_SECONDS, THREE_MINUTES_IN_SECONDS, ZERO } from "@utils/constants";
import { ether, usdc } from "@utils/common/units";

// Deployment Parameters

// Global Parameters
export const MULTI_SIG: any = {
  "localhost": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "sepolia": "",
  "base": "0x0bC26FF515411396DD588Abd6Ef6846E04470227",
  "base_staging": "0xdd93E0f5fC32c86A568d87Cb4f08598f55E980F3",
};

export const FEE_RECIPIENT: any = {
  "localhost": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "sepolia": "",
  "base": "0x0bC26FF515411396DD588Abd6Ef6846E04470227",
  "base_staging": "0xdd93E0f5fC32c86A568d87Cb4f08598f55E980F3",
};

export const FEE_PERCENTAGE: any = {
  "localhost": ether(0.1),
  "sepolia": ether(0.1),
  "base": ether(0.1),
  "base_staging": ether(0.1),
};

export const ORDER_SETTLEMENT_PERIOD: any = {
  "localhost": ONE_DAY_IN_SECONDS,
  "sepolia": ONE_DAY_IN_SECONDS,
  "base": ONE_DAY_IN_SECONDS,
  "base_staging": ONE_DAY_IN_SECONDS,
};

export const REFUND_SETTLEMENT_PERIOD: any = {
  "localhost": ONE_DAY_IN_SECONDS,
  "sepolia": ONE_DAY_IN_SECONDS,
  "base": ONE_DAY_IN_SECONDS,
  "base_staging": ONE_DAY_IN_SECONDS,
};

export const ALLOWED_ADDRESSES: any = {
  "localhost": [],
  "sepolia": [],
  "base": [],
  "base_staging": [],
};

// USDC
export const USDC: any = {
  "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base_staging": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// For Goerli and localhost
export const USDC_MINT_AMOUNT = usdc(1000000);
export const USDC_RECIPIENT = "0x1d2033DC6720e3eCC14aBB8C2349C7ED77E831ad";
