import { useContext } from 'react';

import { RampContext } from '../../contexts/revolut/Ramp';

const useRampState = () => {
  return { ...useContext(RampContext) }
};

export default useRampState;
