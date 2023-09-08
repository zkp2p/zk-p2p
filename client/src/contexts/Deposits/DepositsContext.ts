import { createContext } from 'react'

import { Deposit } from './types'


interface RampRegistrationValues {
  deposits: Deposit[];
}

const defaultValues: RampRegistrationValues = {
  deposits: [],
};

const RampRegistrationContext = createContext<RampRegistrationValues>(defaultValues)

export default RampRegistrationContext
