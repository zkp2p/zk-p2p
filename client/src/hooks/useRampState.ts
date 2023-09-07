import { useContext } from 'react'

import { RampContext } from '../contexts/Ramp'

const useRampState = () => {
  return { ...useContext(RampContext) }
}

export default useRampState
