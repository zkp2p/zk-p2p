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

export interface WiseRegistrationData {
  endpoint: string;
  endpointType: string;
  host: string;
  accountId: string;
}

export interface WiseRegistrationProof {
  public_values: WiseRegistrationData;
  proof: string;
}

export interface WiseSendData {
  endpoint: string;
  endpointType: string;
  host: string;
  transferId: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  currencyId: string;
  amount: string;
  status: string;
  intentHash: string;
}

export interface WiseSendProof {
  public_values: WiseSendData;
  expectedTLSParams: TLSParams;
  proof: string;
}
