import { useContext } from 'react'

import { GoogleAuthContext } from '../contexts/GoogleAuth'

const useGoogleAuth = () => {
  return { ...useContext(GoogleAuthContext) }
}

export default useGoogleAuth
