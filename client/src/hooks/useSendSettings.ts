import { useContext } from 'react';

import { SendSettingsContext } from '../contexts/common/SendSettings';

const useSendSettings = () => {
  return { ...useContext(SendSettingsContext) }
};

export default useSendSettings;
