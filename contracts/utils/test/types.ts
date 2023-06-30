import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Address } from "../types";

export type Account = {
  address: Address;
  wallet: SignerWithAddress;
};
