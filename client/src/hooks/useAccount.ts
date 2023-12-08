import { useContext } from 'react'

import { AccountContext } from '../contexts/common/Account'

const useAccount = () => {
  return { ...useContext(AccountContext) }
}

export default useAccount
