import { useContext } from 'react';

import { OnRamperIntentsContext } from '../../contexts/revolut/OnRamperIntents';

const useOnRamperIntents = () => {
  return { ...useContext(OnRamperIntentsContext) }
};

export default useOnRamperIntents;
