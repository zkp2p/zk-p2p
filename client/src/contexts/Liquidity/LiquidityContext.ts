import { createContext } from 'react'

import { Deposit } from '../Deposits/types'


interface LiquidityValues {
  deposits: Deposit[];
}

const defaultValues: LiquidityValues = {
  deposits: [],
};

const LiquidityContext = createContext<LiquidityValues>(defaultValues)

export default LiquidityContext
