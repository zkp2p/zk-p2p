import { createContext } from 'react'

import { Deposit, StoredDeposit } from '../Deposits/types'


interface LiquidityValues {
  deposits: Deposit[];
  depositStore: StoredDeposit[];
  getBestDepositForAmount: (amount: number) => StoredDeposit | null;
}

const defaultValues: LiquidityValues = {
  deposits: [],
  depositStore: [],
  getBestDepositForAmount: () => null,
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues)

export default LiquidityContext
