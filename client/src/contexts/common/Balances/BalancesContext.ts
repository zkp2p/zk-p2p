import { createContext } from 'react'

import { ContextValues } from './types'

const defaultValues: ContextValues = {
  ethBalance: null,
  refetchEthBalance: null,
  shouldFetchEthBalance: null,
  usdcBalance: null,
  refetchUsdcBalance: null,
  shouldFetchUsdcBalance: null,
  usdcApprovalToRamp: null,
  refetchUsdcApprovalToRamp: null,
  usdcApprovalToHdfcRamp: null,
  refetchUsdcApprovalToHdfcRamp: null,
};

const BalancesContext = createContext<ContextValues>(defaultValues)

export default BalancesContext
