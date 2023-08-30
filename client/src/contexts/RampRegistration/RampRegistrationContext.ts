import { createContext } from 'react'

import { Deposit } from './types'


interface RampRegistrationValues {
  isRegistered: boolean;
  registrationHash: string;
  registeredVenmoId: string;
  deposits: Deposit[];
}

const defaultValues: RampRegistrationValues = {
  isRegistered: false,
  registrationHash: '',
  registeredVenmoId: '',
  deposits: [],
};

const RampRegistrationContext = createContext<RampRegistrationValues>(defaultValues)

export default RampRegistrationContext
