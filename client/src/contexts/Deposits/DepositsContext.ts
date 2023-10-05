import { createContext } from 'react'

import { Deposit, Intent } from './types'


interface DepositsValues {
  deposits: Deposit[] | null;
  depositIntents: Intent[] | null;
}

const defaultValues: DepositsValues = {
  deposits: null,
  depositIntents: null,
};

const DepositsContext = createContext<DepositsValues>(defaultValues)

export default DepositsContext
