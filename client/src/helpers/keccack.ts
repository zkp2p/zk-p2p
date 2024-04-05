import { BigNumber, ethers } from "ethers";


const abiCoder = new ethers.utils.AbiCoder();

export const keccak256 = (inputString: string): string => {
  return ethers.utils.solidityKeccak256(["string"], [inputString]);
};

export const calculateWiseTagHash = (wiseTag: string): string => {
  return BigNumber.from(ethers.utils.keccak256(abiCoder.encode(["string"], [wiseTag]))).toHexString();
};
