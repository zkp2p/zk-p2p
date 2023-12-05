import { useContext } from 'react'

import { SmartContractsContext } from '../contexts/common/SmartContracts'

const useSmartContracts = () => {
  return { ...useContext(SmartContractsContext) }
}

export default useSmartContracts
