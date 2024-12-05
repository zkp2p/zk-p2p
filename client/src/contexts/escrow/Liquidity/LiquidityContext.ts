import { createContext } from 'react';

import {
  DepositView,
  IndicativeQuote,
  StoredDeposit
} from '@helpers/types/escrow';

import {
  calculateUsdFromRequestedUSDC
} from './helper';


interface LiquidityValues {
  deposits: DepositView[] | null;
  depositStore: StoredDeposit[] | null;
  getBestDepositForAmount: ((
    requestedOnRampInputAmount: string,
    requestedPaymentVerifier: string,
    userAddress: string,
    requestedSendCurrency: string
  ) => Promise<IndicativeQuote>) | null;
  // getDepositForMaxAvailableTransferSize: ((requestedPaymentVerifier: string) => IndicativeQuote) | null;
  refetchDeposits: (() => void) | null;
  shouldFetchDeposits: boolean;
  // todo: Update this to calculateFiatFromRequestedToken and also pass in token decimals
  calculateUsdFromRequestedUSDC: (requestedOnRampInputAmount: bigint, conversionRate: bigint) => bigint;
}

const defaultValues: LiquidityValues = {
  deposits: null,
  depositStore: null,
  getBestDepositForAmount: null,
  // getDepositForMaxAvailableTransferSize: null,
  refetchDeposits: null,
  shouldFetchDeposits: false,
  calculateUsdFromRequestedUSDC,
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues);

export default LiquidityContext;
