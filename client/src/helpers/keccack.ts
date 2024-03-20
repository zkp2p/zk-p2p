import { ethers } from "ethers";


export const keccak256 = (inputString: string): string => {
  return ethers.utils.solidityKeccak256(["string"], [inputString]);
};
