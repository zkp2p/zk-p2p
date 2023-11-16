import "module-alias/register";
import { BigNumber } from "ethers";
import { ONE_DAY_IN_SECONDS, THREE_MINUTES_IN_SECONDS, ZERO } from "@utils/constants";
import { ether, usdc } from "@utils/common/units";

// Deployment Parameters
export const SERVER_KEY_HASH = "0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";

export const FROM_EMAIL = "venmo@venmo.com";

export const MIN_DEPOSIT_AMOUNT: any = {
  "localhost": usdc(20),
  "goerli": usdc(20),
  "base": usdc(20),
  "base_staging": usdc(20),
};
export const MAX_ONRAMP_AMOUNT: any = {
  "localhost": usdc(999),
  "goerli": usdc(999),
  "base": usdc(250),
  "base_staging": usdc(999),
};
export const INTENT_EXPIRATION_PERIOD: any = {
  "localhost": ONE_DAY_IN_SECONDS,
  "goerli": ONE_DAY_IN_SECONDS,
  "base": ONE_DAY_IN_SECONDS,
  "base_staging": BigNumber.from(180),
};
export const ONRAMP_COOL_DOWN_PERIOD: any = {
  "localhost": THREE_MINUTES_IN_SECONDS,
  "goerli": ONE_DAY_IN_SECONDS,
  "base": ONE_DAY_IN_SECONDS.div(4),
  "base_staging": BigNumber.from(180),
};
export const SUSTAINABILITY_FEE: any = {
  "localhost": ether(.001),
  "goerli": ether(.001),
  "base": ZERO,
  "base_staging": ZERO,
};
export const SUSTAINABILITY_FEE_RECIPIENT: any = {
  "localhost": "",
  "goerli": "",
  "base": "0x0bC26FF515411396DD588Abd6Ef6846E04470227",
  "base_staging": "0xdd93E0f5fC32c86A568d87Cb4f08598f55E980F3",
};
export const MULTI_SIG: any = {
  "localhost": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "goerli": "",
  "base": "0x0bC26FF515411396DD588Abd6Ef6846E04470227",
  "base_staging": "0xdd93E0f5fC32c86A568d87Cb4f08598f55E980F3",
};

// USDC
export const USDC: any = {
  "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base_staging": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// For Goerli and localhost
export const USDC_MINT_AMOUNT = usdc(1000000);
export const USDC_RECIPIENT = "0x1d2033DC6720e3eCC14aBB8C2349C7ED77E831ad";
