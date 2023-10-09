import { createContext } from 'react'

import { DepositWithAvailableLiquidity, DepositIntent } from './types'


interface DepositsValues {
  deposits: DepositWithAvailableLiquidity[] | null;
  depositIntents: DepositIntent[] | null;
  refetchDeposits: (() => void) | null;
  refetchDepositIntents: (() => void) | null;
}

const defaultValues: DepositsValues = {
  deposits: null,
  depositIntents: null,
  refetchDeposits: null,
  refetchDepositIntents: null,
};

const DepositsContext = createContext<DepositsValues>(defaultValues)

export default DepositsContext
