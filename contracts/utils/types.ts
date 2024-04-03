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
  Wise = "wise",
}

export interface TLSParams {
  verifierSigningKey: Address
  endpoint: string;
  host: string;
}

export interface WiseRegistrationData {
  endpoint: string;
  host: string;
  profileId: string;
  wiseTagHash: string;
}

export interface WiseRegistrationProof {
  public_values: WiseRegistrationData;
  proof: string;
}

export interface WiseOffRamperRegistrationData {
  endpoint: string;
  host: string;
  profileId: string;
  mcAccountId: string;
}

export interface WiseOffRamperRegistrationProof {
  public_values: WiseOffRamperRegistrationData;
  proof: string;
}

export interface WiseSendData {
  endpoint: string;
  host: string;
  transferId: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  currencyId: string;
  amount: string;
  status: string;
  intentHash: BigNumber;
}

export interface WiseSendProof {
  public_values: WiseSendData;
  proof: string;
}