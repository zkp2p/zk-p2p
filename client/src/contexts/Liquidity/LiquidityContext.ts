import { createContext } from 'react'

import { DepositWithAvailableLiquidity, StoredDeposit } from '../Deposits/types'


interface LiquidityValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  depositStore: StoredDeposit[] | null;
  getBestDepositForAmount: (amount: bigint) => StoredDeposit | null;
  refetchDeposits: (() => void) | null;
  shouldFetchDeposits: boolean;
}

const defaultValues: LiquidityValues = {
  deposits: null,
  depositStore: null,
  getBestDepositForAmount: () => null,
  refetchDeposits: null,
  shouldFetchDeposits: false
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues)

export default LiquidityContext
