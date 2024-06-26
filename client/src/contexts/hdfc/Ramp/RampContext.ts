import { createContext } from 'react'


interface RampValues {
  minimumDepositAmount: bigint | null;
  maximumOnRampAmount: bigint | null;
  depositCounter: bigint | null;
  refetchDepositCounter: (() => void) | null;
  shouldFetchRampState: boolean;
  onRampCooldownPeriod: bigint | null;
}

const defaultValues: RampValues = {
  minimumDepositAmount: null,
  maximumOnRampAmount: null,
  depositCounter: null,
  refetchDepositCounter: null,
  shouldFetchRampState: false,
  onRampCooldownPeriod: null
};

const RampContext = createContext<RampValues>(defaultValues)

export default RampContext
