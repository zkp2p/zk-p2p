import { useContext } from 'react';

import { DepositsContext } from '../contexts/legacy/Deposits';

const useLegacyDeposits = () => {
  return { ...useContext(DepositsContext) }
}

export default useLegacyDeposits;
