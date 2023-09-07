import { ethers } from "ethers";

import BigNumber from "./bignumber";


export const ether = (amount: number | string): BigNumber => {
  if (typeof amount === 'number' && amount > Number.MAX_SAFE_INTEGER) {
    throw new Error('Amount is too large to be represented safely.');
  }
  
  const weiString = ethers.utils.parseEther(amount.toString());
  return new BigNumber(weiString.toString());
};

export const usdc = (amount: number): BigNumber => {
  if (amount > Number.MAX_SAFE_INTEGER / 1000000) {
    throw new Error('Amount is too large for safe USDC conversion.');
  }

  const usdcUnits = new BigNumber(amount).multipliedBy(1000000);
  return usdcUnits;
};

export const fromEther = (wei: BigNumber | string): BigNumber => {
  const etherString = ethers.utils.formatEther(wei.toString());
  return new BigNumber(etherString);
};

export const fromUsdc = (usdcUnits: BigNumber | string): BigNumber => {
  return new BigNumber(usdcUnits.toString()).dividedBy(1000000);
};
