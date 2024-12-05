import { useContext } from 'react';

import { OnRamperIntentsContext } from '../../contexts/escrow/OnRamperIntents';

const useOnRamperIntents = () => {
  return { ...useContext(OnRamperIntentsContext) }
}

export default useOnRamperIntents;
