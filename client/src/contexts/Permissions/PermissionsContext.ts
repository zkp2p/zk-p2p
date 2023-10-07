import { createContext } from 'react'
import { Address } from 'wagmi';


interface PermissionsValues {
  deniedUsers: Address[] | null;
  refetchDeniedUsers: (() => void) | null;
}

const defaultValues: PermissionsValues = {
  deniedUsers: null,
  refetchDeniedUsers: null
};

const PermissionsContext = createContext<PermissionsValues>(defaultValues)

export default PermissionsContext
