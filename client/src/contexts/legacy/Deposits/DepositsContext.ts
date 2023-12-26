import { createContext } from 'react'

import { DepositWithAvailableLiquidity } from '../../venmo/Deposits/types';


interface DepositsValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  refetchDeposits: (() => void) | null;
  shouldFetchDeposits: boolean;
}

const defaultValues: DepositsValues = {
  deposits: null,
  refetchDeposits: null,
  shouldFetchDeposits: false,
};

const DepositsContext = createContext<DepositsValues>(defaultValues);

export default DepositsContext;
