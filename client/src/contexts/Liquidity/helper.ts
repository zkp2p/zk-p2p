import { Deposit, StoredDeposit } from "../Deposits/types";


export const createDepositsStore = (depositIds: number[], deposits: Deposit[]): StoredDeposit[] => {
  const zippedDeposits = depositIds.map((id, index) => ({ depositId: id, deposit: deposits[index] }));
  
  const sortedDeposits = zippedDeposits.sort((a, b) => {
    // Sort by descending order of remaining deposit amount
    if (b.deposit.remainingDepositAmount - a.deposit.remainingDepositAmount !== 0) {
      return b.deposit.remainingDepositAmount - a.deposit.remainingDepositAmount;
    }

    // Sort by ascending order of conversion rate
    if (a.deposit.conversionRate - b.deposit.conversionRate !== 0) {
      return a.deposit.conversionRate - b.deposit.conversionRate;
    }

    // Sort by ascending order of convenience fee
    return a.deposit.convenienceFee - b.deposit.convenienceFee;
  });

  return sortedDeposits;
};

export const fetchBestDepositForAmount = (onRampAmount: number, depositStore: StoredDeposit[]): StoredDeposit | null => {
  // Filter deposits that can fulfill the onRampAmount
  const eligibleDeposits = depositStore.filter(deposit => deposit.deposit.remainingDepositAmount >= onRampAmount);
  if (eligibleDeposits.length === 0) {
    return null;
  }

  // Calculate total cost for each eligible deposit and find the one with the minimum cost
  const sortedByCostDeposits = eligibleDeposits.map(deposit => ({
    ...deposit,
    totalCost: deposit.deposit.convenienceFee + (deposit.deposit.conversionRate * onRampAmount),
  })).sort((a, b) => a.totalCost - b.totalCost);

  return sortedByCostDeposits[0];
};

export const pruneDeposits = (depositIds: number[], deposits: Deposit[]): number[] => {
  /*
    TODO: Fill me out, currently returning no deposit ids to prune. This means that all deposits are being re-fetched continuously
  */

  return [];
};
