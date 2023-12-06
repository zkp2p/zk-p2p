import { useContext } from 'react';

import { DepositsContext } from '../../contexts/hdfc/Deposits';

const useDeposits = () => {
  return { ...useContext(DepositsContext) };
}

export default useDeposits;
