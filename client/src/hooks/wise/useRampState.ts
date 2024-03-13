import { useContext } from 'react';

import { RampContext } from '../../contexts/wise/Ramp';

const useRampState = () => {
  return { ...useContext(RampContext) }
};

export default useRampState;
