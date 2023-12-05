import { useContext } from 'react'

import { ProofGenSettingsContext } from '../contexts/common/ProofGenSettings'

const useProofGenSettings = () => {
  return { ...useContext(ProofGenSettingsContext) }
}

export default useProofGenSettings
