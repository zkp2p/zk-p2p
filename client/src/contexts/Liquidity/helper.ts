import { DepositWithAvailableLiquidity, StoredDeposit } from "../Deposits/types";


export const createDepositsStore = (depositIds: bigint[], deposits: DepositWithAvailableLiquidity[]): StoredDeposit[] => {
  const zippedDeposits = depositIds.map((id, index) => ({
    depositId: id,
    deposit: deposits[index].deposit,
    availableLiquidity: deposits[index].availableLiquidity
  }));
  
  const sortedDeposits = zippedDeposits.sort((a, b) => {
    // Sort by descending order of remaining available liquidity
    if (b.availableLiquidity > a.availableLiquidity) {
      return 1;
    }
    if (b.availableLiquidity < a.availableLiquidity) {
      return -1;
    }

    // Sort by ascending order of conversion rate
    if (a.deposit.conversionRate < b.deposit.conversionRate) {
      return -1;
    }
    if (a.deposit.conversionRate > b.deposit.conversionRate) {
      return 1;
    }

    // Sort by ascending order of convenience fee
    if (a.deposit.convenienceFee < b.deposit.convenienceFee) {
      return -1;
    }
    if (a.deposit.convenienceFee > b.deposit.convenienceFee) {
      return 1;
    }

    return 0;
  });

  return sortedDeposits;
};

export const fetchBestDepositForAmount = (onRampAmount: bigint, depositStore: StoredDeposit[]): StoredDeposit | null => {
  // Filter deposits that can fulfill the onRampAmount
  const eligibleDeposits = depositStore.filter(deposit => deposit.availableLiquidity >= onRampAmount);
  if (eligibleDeposits.length === 0) {
    return null;
  }

  // Convert conversionRate to a BigInt, assuming a fixed precision of 2 decimal places
  const sortedByCostDeposits = eligibleDeposits.map(storedDeposit => {
    const conversionRateBigInt = BigInt(storedDeposit.deposit.conversionRate * BigInt(100));
    const totalCost = storedDeposit.deposit.convenienceFee + (conversionRateBigInt * onRampAmount) / BigInt(100);

    return {
      ...storedDeposit,
      totalCost,
    };
  }).sort((a, b) => {
    if (a.totalCost < b.totalCost) return -1;
    if (a.totalCost > b.totalCost) return 1;
    return 0;
  });

  return sortedByCostDeposits[0];
};

export const pruneDeposits = (depositIds: number[], deposits: DepositWithAvailableLiquidity[]): number[] => {
  /*
    TODO: Fill me out, currently returning no deposit ids to prune. This means that all deposits are being re-fetched continuously
  */

  return [];
};
