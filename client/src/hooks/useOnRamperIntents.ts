import { useContext } from 'react'

import { OnRamperIntentsContext } from '../contexts/OnRamperIntents'

const useOnRamperIntents = () => {
  return { ...useContext(OnRamperIntentsContext) }
}

export default useOnRamperIntents
