import { useContext } from 'react'

import { DepositsContext } from '../contexts/venmo/Deposits'

const useDeposits = () => {
  return { ...useContext(DepositsContext) }
}

export default useDeposits
