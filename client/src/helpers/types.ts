export enum OrderStatus {
  UNOPENED = "unopened",
  OPEN = "open",
  FILLED = "filled",
  CANCELLED = "cancelled",
}
  
export interface OnRampOrder {
  orderId: number;
  onRamper: string;
  onRamperEncryptPublicKey: string;
  amountToReceive: number;
  maxAmountToPay: number;
  status: OrderStatus;
}

export enum OrderClaimStatus {
  UNSUBMITTED = "unsubmitted",
  SUBMITTED = "submitted",
  USED = "used",
  CLAWBACK = "clawback"
}

export interface OnRampOrderClaim {
  claimId: number;
  offRamper: string;
  hashedVenmoId: string;
  status: OrderClaimStatus;
  encryptedOffRamperVenmoId: string;
  claimExpirationTime: number;
  minAmountToPay: number;
}
