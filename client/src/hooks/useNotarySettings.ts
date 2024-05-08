import { useContext } from 'react';

import { NotarySettingsContext } from '../contexts/common/NotarySettings';

const useNotarySettings = () => {
  return { ...useContext(NotarySettingsContext) }
};

export default useNotarySettings;
