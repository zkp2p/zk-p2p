import { createContext } from 'react'

import { Deposit } from './types'


interface RampRegistrationValues {
  registrationHash: string;
  registeredVenmoId: string;
  deposits: Deposit[];
}

const defaultValues: RampRegistrationValues = {
  registrationHash: '',
  registeredVenmoId: '',
  deposits: [],
};

const RampRegistrationContext = createContext<RampRegistrationValues>(defaultValues)

export default RampRegistrationContext
