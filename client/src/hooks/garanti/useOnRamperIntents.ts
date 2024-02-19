import { useContext } from 'react';

import { OnRamperIntentsContext } from '../../contexts/garanti/OnRamperIntents';

const useOnRamperIntents = () => {
  return { ...useContext(OnRamperIntentsContext) }
}

export default useOnRamperIntents;
