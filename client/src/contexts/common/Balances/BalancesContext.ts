import { createContext } from 'react'

import { ContextValues } from './types'

const defaultValues: ContextValues = {
  ethBalance: null,
  usdcBalance: null,
  usdcApprovalToRamp: null,
  refetchUsdcApprovalToRamp: null,
  refetchUsdcBalance: null,
  shouldFetchUsdcBalance: null,
  usdcApprovalToHdfcRamp: null,
  refetchUsdcApprovalToHdfcRamp: null,
  usdcApprovalToLifiBridge: null,
  refetchUsdcApprovalToLifiBridge: null,
};

const BalancesContext = createContext<ContextValues>(defaultValues)

export default BalancesContext
