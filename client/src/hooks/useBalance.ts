import { useContext } from 'react'

import { BalancesContext } from '../contexts/common/Balances'

const useBalances = () => {
  return { ...useContext(BalancesContext) }
}

export default useBalances
