// struct Deposit {
//   bytes32 depositor;
//   uint256 remainingDeposits;          // Amount of remaining deposited liquidity
//   uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
//   uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
//   uint256 convenienceFee;             // Amount of USDC per on-ramp transaction available to be claimed by off-ramper
//   bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
// }

export interface Deposit {
  depositor: string;
  remainingDepositAmount: number;
  outstandingIntentAmount: number;
  conversionRate: number;
  convenienceFee: number;
}

export interface DepositPrime {
  depositor: string;
  remainingDepositAmount: number;
  totalDepositAmount: number;
  outstandingIntentAmount: number;
  intentCount: number;
  conversionRate: number;
  convenienceFee: number;
}

// struct Intent {
//   bytes32 onramper;
//   bytes32 deposit;
//   uint256 amount;
//   uint256 intentTimestamp;
// }

export interface Intent {
  onRamper: string;
  deposit: string;
  amount: number;
  timestamp: number;
}
