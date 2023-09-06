import { useContext } from 'react'

import { BalancesContext } from '../contexts/Balances'

const useBalances = () => {
  return { ...useContext(BalancesContext) }
}

export default useBalances
