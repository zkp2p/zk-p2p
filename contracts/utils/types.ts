import { BigNumber } from "ethers";

export type Address = string;

export type GrothProof = {
  a: [BigNumber, BigNumber],
  b: [[BigNumber, BigNumber], [BigNumber, BigNumber]],
  c: [BigNumber, BigNumber],
  signals: BigNumber[]
}

export enum PaymentProviders {
  Venmo = "venmo",
  HDFC = "hdfc",
  Garanti = "garanti",
}

export interface TLSParams {
  notary: Address
  endpoint: string;
  endpointType: string;
  host: string;
}
