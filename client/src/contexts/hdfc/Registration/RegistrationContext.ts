import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string | null;
  storedUpiId: string | null;
  shouldFetchHdfcNftId: boolean;
  hdfcNftId: bigint | null;
  hdfcNftUri: string | null;
  refetchHdfcNftId: (() => void) | null;
  setStoredUpiId: ((upiId: string) => void) | null;
  refetchRampAccount: (() => void) | null;
  shouldFetchRegistration: boolean;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: null,
  storedUpiId: null,
  shouldFetchHdfcNftId: false,
  hdfcNftId: null,
  hdfcNftUri: null,
  refetchHdfcNftId: null,
  setStoredUpiId: null,
  refetchRampAccount: null,
  shouldFetchRegistration: false
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
