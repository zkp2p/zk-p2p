import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string;
  registeredVenmoId: string;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: '',
  registeredVenmoId: '',
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
