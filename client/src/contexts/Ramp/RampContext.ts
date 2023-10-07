import { createContext } from 'react'


interface RampValues {
  minimumDepositAmount: bigint | null;
  convenienceRewardTimePeriod: bigint | null;
  depositCounter: bigint | null;
}

const defaultValues: RampValues = {
  minimumDepositAmount: null,
  convenienceRewardTimePeriod: null,
  depositCounter: null,
};

const RampContext = createContext<RampValues>(defaultValues)

export default RampContext
