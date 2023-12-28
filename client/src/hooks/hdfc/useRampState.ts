import { useContext } from 'react';

import { RampContext } from '../../contexts/hdfc/Ramp';

const useRampState = () => {
  return { ...useContext(RampContext) }
}

export default useRampState;
