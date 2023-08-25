import { createContext } from 'react'


interface RampRegistrationValues {
  registrationHash: string;
}

const defaultValues: RampRegistrationValues = {
  registrationHash: '',
};

const RampRegistrationContext = createContext<RampRegistrationValues>(defaultValues)

export default RampRegistrationContext
