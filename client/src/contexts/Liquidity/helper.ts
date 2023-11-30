import { Address } from 'wagmi';

import {
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from "../Deposits/types";
import { PENNY_IN_USDC_UNITS, PRECISION } from "@helpers/constants";
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
  const rawAmount = requestedOnRampInputAmount * PRECISION / conversionRate;
  const remainder = rawAmount % PENNY_IN_USDC_UNITS;

  if (remainder > 0) {
    return rawAmount - remainder + PENNY_IN_USDC_UNITS;
  } else {
    return rawAmount;
  }
};

export const fetchBestDepositForAmount = (
  requestedOnRampInputAmount: string,
  depositStore: StoredDeposit[],
  targetedDepositIds: bigint[],
  loggedInUserAddress: Address
): IndicativeQuote => {
  const requestedAmountBI = toBigInt(requestedOnRampInputAmount);

  let depositsToSearch: StoredDeposit[] = [];
  if (targetedDepositIds.length > 0) {
    depositsToSearch = depositStore.filter(deposit => targetedDepositIds.includes(deposit.depositId));
  } else {
    depositsToSearch = depositStore;
  }

  for (const deposit of depositsToSearch) {
    const isUserDepositor = deposit.deposit.depositor === loggedInUserAddress;

    const isSufficientLiquidity = deposit.availableLiquidity >= requestedAmountBI;

    if (isSufficientLiquidity && !isUserDepositor) {
      const conversionRate = deposit.deposit.conversionRate;
      
      const usdToSend = calculateUsdFromRequestedUSDC(requestedAmountBI, conversionRate);
      const usdAmountToSend = toUsdString(usdToSend);

      return {
        depositId: deposit.depositId,
        usdAmountToSend,
        conversionRate,
      } as IndicativeQuote;
    }
  }

  return {
    error: "No deposits available to fulfill requested amount"
  } as IndicativeQuote;
};
