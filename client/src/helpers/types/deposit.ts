import { PaymentPlatformType } from '@helpers/types';

export const ReceiveCurrencyId = {
  EUR: "0xfff16d60be267153303bbfa66e593fb8d06e24ea5ef24b6acca5224c2ca6b907", // keccak256("EUR")
  GBP: "0x90832e2dc3221e4d56977c1aa8f6a6706b9ad6542fbbdaac13097d0fa5e42e67", // keccak256("GBP")
  SGD: "0xc241cc1f9752d2d53d1ab67189223a3f330e48b75f73ebf86f50b2c78fe8df88", // keccak256("SGD")
  USD: "0xc4ae21aac0c6549d71dd96035b7e0bdb6c79ebdba8891b666115bc976d16a29e", // keccak256("USD")
};
export type ReceiveCurrencyIdType = typeof ReceiveCurrencyId[keyof typeof ReceiveCurrencyId];

// struct Deposit {
//   address depositor;
//   uint256[5] packedVenmoId;
//   uint256 depositAmount;
//   uint256 remainingDeposits;          // Amount of remaining deposited liquidity
//   uint256 outstandingIntentAmount;    // Amount of outstanding intents (may include expired intents)
//   uint256 conversionRate;             // Conversion required by off-ramper between USDC/USD
//   bytes32[] intentHashes;             // Array of hashes of all open intents (may include some expired if not pruned)
//   bytes32 receiveCurrencyId; // Id of the currency to be received off-chain (bytes32(Wise currency code))
// }
export interface Deposit {
  platformType: PaymentPlatformType;
  depositor: string;
  venmoId: string;
  offRamperName?: string;
  depositAmount: bigint;
  remainingDepositAmount: bigint;
  outstandingIntentAmount: bigint;
  conversionRate: bigint;
  intentHashes: string[];
  notaryKeyHash?: string;
  receiveCurrencyId?: ReceiveCurrencyIdType;
}

// struct DepositWithAvailableLiquidity {
//    deposit: Deposit;
//    uint256: availableLiquidity;
//    bytes32: depositorIdHash;
//    uint256: depositId;
// }
export interface DepositWithAvailableLiquidity {
  depositId: bigint;
  deposit: Deposit;
  availableLiquidity: bigint;
  depositorIdHash: string;
} // DepositsProvider.getAccountDeposits, LiquidityProvider.getDepositFromIds

export interface StoredDeposit extends DepositWithAvailableLiquidity {
  depositId: bigint;
}

export interface IndicativeQuote {
  depositId?: bigint;
  usdAmountToSend?: string;
  error?: string;
  maxUSDCAmountAvailable?: string;
  conversionRate?: bigint;
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
  deposit: bigint;
  amount: bigint;
  timestamp: bigint;
  to: string;
}

export interface DepositIntent {
  onRamperVenmoHash: string;
  deposit: Deposit;
  intent: Intent;
  intentHash: string;
}

export interface OnRamperIntent {
  depositorVenmoId: string;
  intent: Intent;
}
