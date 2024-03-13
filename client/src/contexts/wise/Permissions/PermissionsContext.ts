import { createContext } from 'react'


interface PermissionsValues {
  deniedUsers: string[] | null;
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
