import { useContext } from 'react';

import { OnRamperIntentsContext } from '../../contexts/wise/OnRamperIntents';

const useOnRamperIntents = () => {
  return { ...useContext(OnRamperIntentsContext) }
};

export default useOnRamperIntents;
