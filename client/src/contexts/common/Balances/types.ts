export interface ContextValues {
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
}
