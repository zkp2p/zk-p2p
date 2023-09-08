import { createContext } from 'react'

import { Deposit, Intent } from './types'


interface RegistrationValues {
  deposits: Deposit[];
  depositIntents: Intent[];
}

const defaultValues: RegistrationValues = {
  deposits: [],
  depositIntents: [],
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
