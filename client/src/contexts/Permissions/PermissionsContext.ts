import { createContext } from 'react'
import { Address } from 'wagmi';


interface PermissionsValues {
  deniedUsers?: Address[];
}

const defaultValues: PermissionsValues = {};

const PermissionsContext = createContext<PermissionsValues>(defaultValues)

export default PermissionsContext
