import { useContext } from 'react'

import { ProofGenSettingsContext } from '../contexts/ProofGenSettings'

const useProofGenSettings = () => {
  return { ...useContext(ProofGenSettingsContext) }
}

export default useProofGenSettings
