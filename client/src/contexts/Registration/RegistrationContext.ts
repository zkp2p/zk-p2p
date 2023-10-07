import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string | null;
  registeredVenmoId: string | null;
  refetchRampAccount: (() => void) | null;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: null,
  registeredVenmoId: null,
  refetchRampAccount: null
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
