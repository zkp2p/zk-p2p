import { useContext } from 'react'

import { PlatformSettingsContext } from '../contexts/PlatformSettings'

const usePlatformSettings = () => {
  return { ...useContext(PlatformSettingsContext) }
}

export default usePlatformSettings
