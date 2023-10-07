import { createContext } from 'react'

import { DepositWithAvailableLiquidity, StoredDeposit } from '../Deposits/types'


interface LiquidityValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  depositStore: StoredDeposit[] | null;
  getBestDepositForAmount: (amount: bigint) => StoredDeposit | null;
}

const defaultValues: LiquidityValues = {
  deposits: null,
  depositStore: null,
  getBestDepositForAmount: () => null,
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues)

export default LiquidityContext
