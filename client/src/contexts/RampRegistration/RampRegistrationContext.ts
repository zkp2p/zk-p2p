import { createContext } from 'react'

import { Deposit } from './types'


interface RampRegistrationValues {
  registrationHash: string;
  deposits: Deposit[];
}

const defaultValues: RampRegistrationValues = {
  registrationHash: '',
  deposits: [],
};

const RampRegistrationContext = createContext<RampRegistrationValues>(defaultValues)

export default RampRegistrationContext
