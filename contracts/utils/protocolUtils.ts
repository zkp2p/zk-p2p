import { ethers } from "ethers";
import { BigNumber } from "ethers";

export const calculateDepositHash = (
  venmoId: string,
  conversionRate: BigNumber,
  convenienceFee: BigNumber
): string => {
  return ethers.utils.solidityKeccak256(
    ["bytes32", "uint256", "uint256"],
    [venmoId, conversionRate, convenienceFee]
  );
};

export const calculateIntentHash = (
  venmoId: string,
  depositHash: string,
  timestamp: BigNumber
): string => {
  return ethers.utils.solidityKeccak256(
    ["bytes32", "bytes32", "uint256"],
    [venmoId, depositHash, timestamp]
  );
};
