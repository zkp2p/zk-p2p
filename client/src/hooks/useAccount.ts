import { useContext } from 'react'

import { AccountContext } from '../contexts/Account'

const useAccount = () => {
  return { ...useContext(AccountContext) }
}

export default useAccount
