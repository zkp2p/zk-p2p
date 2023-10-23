export interface ContextValues {
  ethBalance: bigint | null
  usdcBalance: bigint | null
  usdcApprovalToRamp: bigint | null
  refetchUsdcApprovalToRamp: (() => void) | null
  refetchUsdcBalance: (() => void) | null
  shouldFetchUsdcBalance: boolean | null
}
