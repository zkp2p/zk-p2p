import { useContext } from 'react'

import { PermissionsContext } from '../contexts/venmo/Permissions'

const usePermissions = () => {
  return { ...useContext(PermissionsContext) }
}

export default usePermissions
