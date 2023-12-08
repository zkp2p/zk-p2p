import { useContext } from 'react'

import { PlatformSettingsContext } from '../contexts/common/PlatformSettings'

const usePlatformSettings = () => {
  return { ...useContext(PlatformSettingsContext) }
}

export default usePlatformSettings
