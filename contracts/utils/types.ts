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
  Revolut = "revolut",
}

export interface TLSParams {
  verifierSigningKey: Address
  endpoint: string;
  host: string;
}

// Wise Proof Types
export interface WiseRegistrationData {
  endpoint: string;
  host: string;
  profileId: string;
  wiseTagHash: string;
  userAddress: Address;
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

// Revolut Proof Types
export interface RevolutRegistrationData {
  endpoint: string;
  host: string;
  profileId: string;
  userAddress: Address;
}

export interface RevolutRegistrationProof {
  public_values: RevolutRegistrationData;
  proof: string;
}

export interface RevolutSendData {
  endpoint: string;
  host: string;
  transferId: string;
  recipientId: string;
  amount: string;
  currencyId: string;
  status: string;
  timestamp: string;
  intentHash: BigNumber;
}

export interface RevolutSendProof {
  public_values: RevolutSendData;
  proof: string;
}
