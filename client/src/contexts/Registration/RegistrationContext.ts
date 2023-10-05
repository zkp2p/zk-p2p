import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string | null;
  registeredVenmoId: string | null;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: null,
  registeredVenmoId: null,
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
