import { useContext } from 'react'

import { RegistrationContext } from '../contexts/venmo/Registration'

const useRegistration = () => {
  return { ...useContext(RegistrationContext) }
}

export default useRegistration
