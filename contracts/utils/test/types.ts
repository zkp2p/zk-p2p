import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Address } from "../types";

export type Account = {
  address: Address;
  wallet: SignerWithAddress;
};
