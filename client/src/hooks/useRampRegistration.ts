import { useContext } from 'react'

import { RampRegistrationContext } from '../contexts/RampRegistration'

const useRampRegistration = () => {
  return { ...useContext(RampRegistrationContext) }
}

export default useRampRegistration
