import { createContext } from 'react'
import { Address } from 'wagmi';


interface PermissionsValues {
  deniedUsers: Address[] | null;
  refetchDeniedUsers: (() => void) | null;
  shouldFetchDeniedUsers: boolean;
}

const defaultValues: PermissionsValues = {
  deniedUsers: null,
  refetchDeniedUsers: null,
  shouldFetchDeniedUsers: false
};

const PermissionsContext = createContext<PermissionsValues>(defaultValues)

export default PermissionsContext
