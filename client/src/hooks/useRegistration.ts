import { useContext } from 'react'

import { RegistrationContext } from '../contexts/Registration'

const useRampRegistration = () => {
  return { ...useContext(RegistrationContext) }
}

export default useRampRegistration
