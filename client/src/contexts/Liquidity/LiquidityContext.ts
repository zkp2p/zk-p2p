import { createContext } from 'react'

import {
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from '../Deposits/types'

import {
  calculateUsdFromRequestedUSDC
} from './helper'


interface LiquidityValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  depositStore: StoredDeposit[] | null;
  getBestDepositForAmount: ((requestedOnRampInputAmount: string) => IndicativeQuote) | null;
  refetchDeposits: (() => void) | null;
  shouldFetchDeposits: boolean;
  calculateUsdFromRequestedUSDC: (requestedOnRampInputAmount: bigint, conversionRate: bigint) => bigint;
  targetedDepositIds: bigint[] | null;
  setTargetedDepositIds: (targetedDepositIds: bigint[]) => void;
}

const defaultValues: LiquidityValues = {
  deposits: null,
  depositStore: null,
  getBestDepositForAmount: null,
  refetchDeposits: null,
  shouldFetchDeposits: false,
  calculateUsdFromRequestedUSDC,
  targetedDepositIds: null,
  setTargetedDepositIds: () => {}
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues)

export default LiquidityContext
