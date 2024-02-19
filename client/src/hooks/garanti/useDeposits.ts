import { useContext } from 'react';

import { DepositsContext } from '../../contexts/garanti/Deposits';

const useDeposits = () => {
  return { ...useContext(DepositsContext) };
}

export default useDeposits;
