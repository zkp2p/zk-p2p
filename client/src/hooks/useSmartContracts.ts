import { useContext } from 'react'

import { SmartContractsContext } from '../contexts/SmartContracts'

const useSmartContracts = () => {
  return { ...useContext(SmartContractsContext) }
}

export default useSmartContracts
