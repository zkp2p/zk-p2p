import { createContext } from 'react'

import { Deposit } from '../Deposits/types'


interface RampRegistrationValues {
  isRegistered: boolean;
  registrationHash: string;
  registeredVenmoId: string;
}

const defaultValues: RampRegistrationValues = {
  isRegistered: false,
  registrationHash: '',
  registeredVenmoId: '',
};

const RampRegistrationContext = createContext<RampRegistrationValues>(defaultValues)

export default RampRegistrationContext
