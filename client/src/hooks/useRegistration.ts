import { useContext } from 'react'

import { RegistrationContext } from '../contexts/Registration'

const useRegistration = () => {
  return { ...useContext(RegistrationContext) }
}

export default useRegistration
