import { createContext } from 'react'

import { DepositWithAvailableLiquidity, DepositIntent } from './types'


interface DepositsValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  depositIntents: DepositIntent[] | null;
  refetchDeposits: (() => void) | null;
  shouldFetchDeposits: boolean;
  refetchDepositIntents: (() => void) | null;
  shouldFetchDepositIntents: boolean;
}

const defaultValues: DepositsValues = {
  deposits: null,
  depositIntents: null,
  refetchDeposits: null,
  shouldFetchDeposits: false,
  refetchDepositIntents: null,
  shouldFetchDepositIntents: false
};

const DepositsContext = createContext<DepositsValues>(defaultValues)

export default DepositsContext
