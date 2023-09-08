import { createContext } from 'react'

import { Deposit, Intent } from './types'


interface DepositsValues {
  deposits: Deposit[];
  depositIntents: Intent[];
}

const defaultValues: DepositsValues = {
  deposits: [],
  depositIntents: [],
};

const DepositsContext = createContext<DepositsValues>(defaultValues)

export default DepositsContext
