import {
  IndicativeQuote,
  StoredDeposit
} from '@helpers/types/escrow';
import {
  DepositView
} from '@helpers/types/escrow';
import { PENNY_IN_USDC_UNITS, PRECISION } from "@helpers/constants";
import { toBigInt, toUsdString, toUsdcString } from "@helpers/units";


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
  requestedPaymentVerifier: string,
  userAddress: string,
  depositStore: StoredDeposit[]
): IndicativeQuote => {
  const requestedAmountBI = toBigInt(requestedOnRampInputAmount);

  let depositsToSearch: StoredDeposit[] = depositStore;
  for (const deposit of depositsToSearch) {
    const isUserDepositor = deposit.deposit.depositor === userAddress;

    const isSufficientLiquidity = deposit.availableLiquidity >= requestedAmountBI;
    const paymentVerifierData = deposit.verifiers.find(verifier => verifier.verifier === requestedPaymentVerifier);

    if (isSufficientLiquidity && paymentVerifierData && !isUserDepositor) {
      const conversionRate = paymentVerifierData.verificationData.conversionRate;

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
  paymentVerifier: string,
  userAddress: string,
  depositStore: StoredDeposit[]
): IndicativeQuote => {
  let largestAvailableDeposit: StoredDeposit | null = null;
  let largestAmount: bigint = BigInt(0);

  for (const deposit of depositStore) {
    const isUserDepositor = deposit.deposit.depositor === userAddress;
    const isSufficientLiquidity = deposit.availableLiquidity >= maxAmount;
    const paymentVerifierData = deposit.verifiers.find(verifier => verifier.verifier === paymentVerifier);

    if (!isUserDepositor && paymentVerifierData) {
      if (isSufficientLiquidity) {
        const conversionRate = paymentVerifierData.verificationData.conversionRate;
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
    const paymentVerifierData = largestAvailableDeposit.verifiers.find(verifier => verifier.verifier === paymentVerifier);
    const conversionRate = paymentVerifierData?.verificationData.conversionRate;
    const usdToSend = calculateUsdFromRequestedUSDC(largestAmount, conversionRate!);
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
