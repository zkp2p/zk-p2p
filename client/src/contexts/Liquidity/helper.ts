import { Address } from 'wagmi';

import {
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from "../Deposits/types";
import { PRECISION } from "@helpers/constants";
import { toBigInt, toUsdString } from "@helpers/units";


export const createDepositsStore = (deposits: DepositWithAvailableLiquidity[]): StoredDeposit[] => {
  const sortedDeposits = deposits.sort((a, b) => {
    // Sort by ascending order of conversion rate
    if (a.deposit.conversionRate > b.deposit.conversionRate) {
      return -1;
    }
    if (a.deposit.conversionRate < b.deposit.conversionRate) {
      return 1;
    }
    
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

export const calculateUsdFromRequestedUSDC = (requestedOnRampInputAmount: bigint, conversionRate: bigint): bigint => {
  return requestedOnRampInputAmount * PRECISION / conversionRate;
}

export const fetchBestDepositForAmount = (requestedOnRampInputAmount: string, depositStore: StoredDeposit[]): IndicativeQuote => {
  const requestedAmountBI = toBigInt(requestedOnRampInputAmount);

  for (const storedDeposit of depositStore) {

    if (storedDeposit.availableLiquidity >= requestedAmountBI) {
      const conversionRate = storedDeposit.deposit.conversionRate;
      const usdToSend = calculateUsdFromRequestedUSDC(requestedAmountBI, conversionRate);
      const usdAmountToSend = toUsdString(usdToSend);

      return {
        depositId: storedDeposit.depositId,
        usdAmountToSend,
      } as IndicativeQuote;
    }
  }

  return {
    error: "No deposits available to fulfill requested amount"
  } as IndicativeQuote;
};

export const pruneDeposits = (deposits: DepositWithAvailableLiquidity[], userAddress: Address): DepositWithAvailableLiquidity[] => {
  return deposits.filter(deposit => deposit.deposit.depositor !== userAddress);
};
