import { createContext } from 'react'

import { Deposit } from './types'


interface RegistrationValues {
  deposits: Deposit[];
}

const defaultValues: RegistrationValues = {
  deposits: [],
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
