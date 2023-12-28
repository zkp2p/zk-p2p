import { useContext } from 'react'

import { RampContext } from '../../contexts/venmo/Ramp'

const useRampState = () => {
  return { ...useContext(RampContext) }
}

export default useRampState
