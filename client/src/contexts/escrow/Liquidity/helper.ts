import {
  StoredDeposit
} from '@helpers/types/escrow';
import {
  DepositView
} from '@helpers/types/escrow';

export const createDepositsStore = (deposits: DepositView[]): StoredDeposit[] => {
  const sortedDeposits = deposits.sort((a, b) => {
    // Sort by descending order of remaining available liquidity
    if (b.availableLiquidity > a.availableLiquidity) {
      return 1;
    }
    if (b.availableLiquidity < a.availableLiquidity) {
      return -1;
    }

    return 0;
  });

  return sortedDeposits;
};