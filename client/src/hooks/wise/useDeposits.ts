import { useContext } from 'react';

import { DepositsContext } from '../../contexts/wise/Deposits';

const useDeposits = () => {
  return { ...useContext(DepositsContext) };
};

export default useDeposits;
