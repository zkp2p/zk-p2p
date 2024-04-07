import { createContext } from 'react'


interface RegistrationValues {
  isRegistered: boolean;
  registrationHash: string | null; // wiseTagHash
  isRegisteredForDeposit: boolean;
  offRampId: string | null;
  accountId: string | null;
  extractedWiseProfileId: string | null;
  shouldFetchVenmoNftId: boolean;
  venmoNftId: bigint | null;
  venmoNftUri: string | null;
  refetchVenmoNftId: (() => void) | null;
  setExtractedWiseProfileId: ((venmoId: string) => void) | null;
  refetchRampAccount: (() => void) | null;
  shouldFetchRegistration: boolean;
}

const defaultValues: RegistrationValues = {
  isRegistered: false,
  registrationHash: null,
  isRegisteredForDeposit: false,
  offRampId: null,
  accountId: null,
  extractedWiseProfileId: null,
  shouldFetchVenmoNftId: false,
  venmoNftId: null,
  venmoNftUri: null,
  refetchVenmoNftId: null,
  setExtractedWiseProfileId: null,
  refetchRampAccount: null,
  shouldFetchRegistration: false
};

const RegistrationContext = createContext<RegistrationValues>(defaultValues)

export default RegistrationContext
