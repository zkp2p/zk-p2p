import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string | null;
  registeredVenmoId: string | null;
  refetchRampAccount: (() => void) | null;
  shouldFetchRegistration: boolean;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: null,
  registeredVenmoId: null,
  refetchRampAccount: null,
  shouldFetchRegistration: false
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
