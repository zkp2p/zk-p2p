import { useContext } from 'react';

import { OnRamperIntentsContext } from '../../contexts/hdfc/OnRamperIntents';

const useOnRamperIntents = () => {
  return { ...useContext(OnRamperIntentsContext) }
}

export default useOnRamperIntents;
