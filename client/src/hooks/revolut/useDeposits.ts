import { useContext } from 'react';

import { DepositsContext } from '../../contexts/revolut/Deposits';

const useDeposits = () => {
  return { ...useContext(DepositsContext) };
};

export default useDeposits;
