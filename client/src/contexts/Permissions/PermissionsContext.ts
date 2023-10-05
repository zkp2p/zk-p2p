import { createContext } from 'react'
import { Address } from 'wagmi';


interface PermissionsValues {
  deniedUsers: Address[] | null;
}

const defaultValues: PermissionsValues = {
  deniedUsers: null,
};

const PermissionsContext = createContext<PermissionsValues>(defaultValues)

export default PermissionsContext
