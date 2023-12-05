import { useContext } from 'react'

import { GoogleAuthContext } from '../contexts/common/GoogleAuth'

const useGoogleAuth = () => {
  return { ...useContext(GoogleAuthContext) }
}

export default useGoogleAuth
