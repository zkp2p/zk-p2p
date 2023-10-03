import { ethers } from "ethers";


// Converts human readable Wei to BigInt for smart contract arguments or math
export const ether = (amount: string): bigint => {
  const weiString = ethers.utils.parseEther(amount);
  return BigInt(weiString.toString());
};

// Converts human readable USDC to BigInt for smart contract arguments or math
export const usdc = (amount: string): bigint => {
  const usdcUnits = BigInt(amount) * BigInt(1000000);
  return BigInt(usdcUnits);
};

export const fromEtherToNaturalString = (wei: bigint): string => {
  const etherString = ethers.utils.formatEther(wei.toString());
  return etherString;
};

export const fromUsdcToNaturalBigInt = (usdcUnits: bigint): bigint => {
  const convertedUSDC = BigInt(usdcUnits.toString()) / BigInt(1000000);
  return convertedUSDC;
}

export const fromUsdcToNaturalString = (usdcUnits: bigint): string => {
  return fromUsdcToNaturalBigInt(usdcUnits).toString();
};
