import { useContext } from 'react'

import { DepositsContext } from '../contexts/Deposits'

const useDeposits = () => {
  return { ...useContext(DepositsContext) }
}

export default useDeposits
