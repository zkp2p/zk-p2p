import { Deposit } from "../Deposits/types";

// interface Deposit {
//   depositor: string;
//   remainingDepositAmount: number;
//   outstandingIntentAmount: number;
//   conversionRate: number;
//   convenienceFee: number;
//   intentHashes: string[];
// }

export const pruneDeposits = (depositIds: number[], deposits: Deposit[]): number[] => {
  // Prune deposits with no remaining deposit amount and return array of depositIds to store to localStorage
  return [];
};

export const liquidityForDeposits = (depositIds: number[], deposits: Deposit[]): number[] => {
  /*
   * Construct new data structure for listing liquidity:
   *  - in descending order of size, sorted by 
   *  - in ascending order of conversion rate
   *  - in ascending order of convenience fee
   * 
   * The liquidity hook will contain a function to pass in input size from swap modal and return the output
   */
  return [];
};
