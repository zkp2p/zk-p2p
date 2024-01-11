import { useContext } from 'react'

import { DenyListContext } from '../contexts/common/DenyList'

const useDenyList = () => {
  return { ...useContext(DenyListContext) }
}

export default useDenyList;
