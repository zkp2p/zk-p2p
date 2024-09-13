import { ethers } from "hardhat";
import { BigNumber } from "ethers";

export const ether = (amount: number | string): BigNumber => {
  const weiString = ethers.utils.parseEther(amount.toString());
  return BigNumber.from(weiString);
};

export const usdc = (amount: number): BigNumber => {
  const weiString = 1000000 * amount;
  return BigNumber.from(weiString);
};
