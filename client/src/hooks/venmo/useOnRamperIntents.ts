import { useContext } from 'react'

import { OnRamperIntentsContext } from '../../contexts/venmo/OnRamperIntents'

const useOnRamperIntents = () => {
  return { ...useContext(OnRamperIntentsContext) }
}

export default useOnRamperIntents
