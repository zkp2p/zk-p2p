import { useContext } from 'react';

import { RampContext } from '../../contexts/garanti/Ramp';

const useRampState = () => {
  return { ...useContext(RampContext) }
}

export default useRampState;
