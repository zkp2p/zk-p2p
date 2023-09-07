import { createContext } from 'react'

import { Deposit } from './types'


interface RampRegistrationValues {
  isRegistered: boolean;
  registrationHash: string;
  registeredVenmoId: string;
  minimumDepositAmount: number;
  deposits: Deposit[];
}

const defaultValues: RampRegistrationValues = {
  isRegistered: false,
  registrationHash: '',
  registeredVenmoId: '',
  minimumDepositAmount: 0,
  deposits: [],
};

const RampRegistrationContext = createContext<RampRegistrationValues>(defaultValues)

export default RampRegistrationContext
