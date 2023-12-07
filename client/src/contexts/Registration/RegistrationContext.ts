import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string | null;
  extractedVenmoId: string | null;
  shouldFetchVenmoNftId: boolean;
  venmoNftId: bigint | null;
  venmoNftUri: string | null;
  refetchVenmoNftId: (() => void) | null;
  setExtractedVenmoId: ((venmoId: string) => void) | null;
  refetchRampAccount: (() => void) | null;
  shouldFetchRegistration: boolean;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: null,
  extractedVenmoId: null,
  shouldFetchVenmoNftId: false,
  venmoNftId: null,
  venmoNftUri: null,
  refetchVenmoNftId: null,
  setExtractedVenmoId: null,
  refetchRampAccount: null,
  shouldFetchRegistration: false
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
