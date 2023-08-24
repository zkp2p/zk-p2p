import { ethers } from "ethers";
import { BigNumber } from "ethers";

export const calculateIntentHash = (
  venmoId: string,
  depositId: BigNumber,
  timestamp: BigNumber
): string => {
  return ethers.utils.solidityKeccak256(
    ["bytes32", "uint256", "uint256"],
    [venmoId, depositId, timestamp]
  );
};
