import { createContext } from 'react'

import { DepositWithAvailableLiquidity } from '../../../helpers/types/deposit';


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
