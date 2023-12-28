import { createContext } from 'react';

import {
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from '@helpers/types';

import {
  calculateUsdFromRequestedUSDC
} from '../../venmo/Liquidity/helper';


interface LiquidityValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  depositStore: StoredDeposit[] | null;
  getBestDepositForAmount: ((requestedOnRampInputAmount: string, onRamperAddress: string) => IndicativeQuote) | null;
  refetchDeposits: (() => void) | null;
  shouldFetchDeposits: boolean;
  calculateUsdFromRequestedUSDC: (requestedOnRampInputAmount: bigint, conversionRate: bigint) => bigint;
  targetedDepositIds: bigint[] | null;
  updateTargetedDepositIds: (targetedDepositIds: bigint[]) => void;
}

const defaultValues: LiquidityValues = {
  deposits: null,
  depositStore: null,
  getBestDepositForAmount: null,
  refetchDeposits: null,
  shouldFetchDeposits: false,
  calculateUsdFromRequestedUSDC,
  targetedDepositIds: null,
  updateTargetedDepositIds: () => {}
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues);

export default LiquidityContext;
