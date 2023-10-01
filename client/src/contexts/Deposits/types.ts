// struct Deposit {
//   address depositor;
//   uint256[5] packedVenmoId;
//   uint256 depositAmount;
//   uint256 remainingDeposits;          // Amount of remaining deposited liquidity
//   uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
//   uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
//   uint256 convenienceFee;             // Amount of USDC per on-ramp transaction available to be claimed by off-ramper
//   bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
// }
export interface Deposit { // TODO: these should all be big numbers at some point
  depositor: string;
  venmoId: string;
  depositAmount: number;
  remainingDepositAmount: number;
  outstandingIntentAmount: number;
  conversionRate: number;
  convenienceFee: number;
  intentHashes: string[];
}

export interface StoredDeposit {
  depositId: number;
  deposit: Deposit;
}

// struct Intent {
//   address onramper;
//   uint256 deposit;
//   uint256 amount;
//   uint256 intentTimestamp;
//   address to;
// }
export interface Intent {
  onRamper: string;
  deposit: string;
  amount: number;
  timestamp: number;
  to: string;
}
