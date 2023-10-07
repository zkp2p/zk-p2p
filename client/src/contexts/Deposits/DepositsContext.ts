import { createContext } from 'react'

import { Deposit, DepositIntent } from './types'


interface DepositsValues {
  deposits: Deposit[] | null;
  depositIntents: DepositIntent[] | null;
}

const defaultValues: DepositsValues = {
  deposits: null,
  depositIntents: null,
};

const DepositsContext = createContext<DepositsValues>(defaultValues)

export default DepositsContext
