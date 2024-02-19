import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string | null;
  storedGarantiId: string | null;
  shouldFetchGarantiNftId: boolean;
  garantiNftId: bigint | null;
  garantiNftUri: string | null;
  refetchGarantiNftId: (() => void) | null;
  setStoredGarantiId: ((upiId: string) => void) | null;
  refetchRampAccount: (() => void) | null;
  shouldFetchRegistration: boolean;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: null,
  storedGarantiId: null,
  shouldFetchGarantiNftId: false,
  garantiNftId: null,
  garantiNftUri: null,
  refetchGarantiNftId: null,
  setStoredGarantiId: null,
  refetchRampAccount: null,
  shouldFetchRegistration: false
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
