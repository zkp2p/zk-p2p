import { createContext } from 'react'

import { DepositWithAvailableLiquidity, DepositIntent } from './types'


interface DepositsValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  depositIntents: DepositIntent[] | null;
}

const defaultValues: DepositsValues = {
  deposits: null,
  depositIntents: null,
};

const DepositsContext = createContext<DepositsValues>(defaultValues)

export default DepositsContext
