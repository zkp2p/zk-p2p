import { useContext } from 'react'

import { PermissionsContext } from '../contexts/Permissions'

const usePermissions = () => {
  return { ...useContext(PermissionsContext) }
}

export default usePermissions
