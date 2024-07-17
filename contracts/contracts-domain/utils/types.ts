import { BigNumber } from "ethers";

export type Address = string;

interface OnchainStruct {
  [key: string]: string;
}

export interface TicketRaw extends OnchainStruct {
  isTransferrable: string;
  rawId: string;
  section: string;
  row: string;
  seat: string;
}

export interface EventRaw extends OnchainStruct {
  rawId: string;
  eventName: string;
  venue: string;
  startTime: string;
  eventUrl: string;
}

export interface Event {
  rawId: string;
  eventName: string;
  venue: string;
  startTime: BigNumber;
  eventUrl: string;
}

export interface GroupRaw extends OnchainStruct {
  tickets: string;
  email: string;
  status: string;
  role: string;
}

export interface Proof {
  claimInfo: ClaimInfo;
  signedClaim: SignedClaim;
}

export interface ClaimInfo {
  provider: string;
  parameters: string;
  context: string;
}

export interface CompleteClaimData {
  identifier: string;
  owner: Address;
  timestampS: BigNumber;
  epoch: BigNumber;
}

export interface SignedClaim {
  claim: CompleteClaimData;
  signatures: string[];
}
