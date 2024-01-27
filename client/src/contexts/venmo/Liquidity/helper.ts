import {
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from '@helpers/types';
import { PENNY_IN_USDC_UNITS, PRECISION } from "@helpers/constants";
import { toBigInt, toUsdString, toUsdcString } from "@helpers/units";


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
  userCurrentIdHash: string = ''
): IndicativeQuote => {
  const requestedAmountBI = toBigInt(requestedOnRampInputAmount);

  let depositsToSearch: StoredDeposit[] = depositStore;
  for (const deposit of depositsToSearch) {
    const isUserDepositor = deposit.depositorIdHash === userCurrentIdHash;

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

export const fetchDepositForMaxAvailableTransferSize = (
  maxAmount: bigint,
  depositStore: StoredDeposit[],
  userCurrentIdHash: string = ''
): IndicativeQuote => {
  let largestAvailableDeposit: StoredDeposit | null = null;
  let largestAmount: bigint = BigInt(0);

  for (const deposit of depositStore) {
    const isUserDepositor = deposit.depositorIdHash === userCurrentIdHash;
    const isSufficientLiquidity = deposit.availableLiquidity >= maxAmount;

    if (!isUserDepositor) {
      if (isSufficientLiquidity) {
        const conversionRate = deposit.deposit.conversionRate;
        const usdToSend = calculateUsdFromRequestedUSDC(maxAmount, conversionRate);
        const usdAmountToSend = toUsdString(usdToSend);
        const maxAmountString = toUsdcString(maxAmount);

        return {
          depositId: deposit.depositId,
          maxUSDCAmountAvailable: maxAmountString,
          usdAmountToSend,
          conversionRate,
        } as IndicativeQuote;
      } else if (deposit.availableLiquidity > largestAmount) {
        largestAvailableDeposit = deposit;
        largestAmount = deposit.availableLiquidity;
      }
    }
  }

  if (largestAvailableDeposit) {
    const conversionRate = largestAvailableDeposit.deposit.conversionRate;
    const usdToSend = calculateUsdFromRequestedUSDC(largestAmount, conversionRate);
    const usdAmountToSend = toUsdString(usdToSend);
    const largestAmountString = toUsdcString(largestAmount);

    return {
      depositId: largestAvailableDeposit.depositId,
      maxUSDCAmountAvailable: largestAmountString,
      usdAmountToSend,
      conversionRate,
    } as IndicativeQuote;
  }

  return {
    error: "No deposits available to fulfill requested amount"
  } as IndicativeQuote;
};
