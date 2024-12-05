import { useContext } from 'react';

import { DepositsContext } from '../../contexts/escrow/Deposits';

const useDeposits = () => {
  return { ...useContext(DepositsContext) };
}

export default useDeposits;
