import { createContext } from 'react'

interface BalancesValues {
  ethBalance: bigint | null
  refetchEthBalance: (() => void) | null
  shouldFetchEthBalance: boolean | null
  usdcBalance: bigint | null
  refetchUsdcBalance: (() => void) | null
  shouldFetchUsdcBalance: boolean | null
  usdcApprovalToRamp: bigint | null
  refetchUsdcApprovalToRamp: (() => void) | null
  usdcApprovalToHdfcRamp: bigint | null
  refetchUsdcApprovalToHdfcRamp: (() => void) | null
  usdcApprovalToGarantiRamp: bigint | null
  refetchUsdcApprovalToGarantiRamp: (() => void) | null
  usdcApprovalToSocketBridge: bigint | null
  refetchUsdcApprovalToSocketBridge: (() => void) | null
  usdcApprovalToLifiBridge: bigint | null
  refetchUsdcApprovalToLifiBridge: (() => void) | null
}

const defaultValues: BalancesValues = {
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
  usdcApprovalToGarantiRamp: null,
  refetchUsdcApprovalToGarantiRamp: null,
  usdcApprovalToSocketBridge: null,
  refetchUsdcApprovalToSocketBridge: null,
  usdcApprovalToLifiBridge: null,
  refetchUsdcApprovalToLifiBridge: null,
};

const BalancesContext = createContext<BalancesValues>(defaultValues)

export default BalancesContext
