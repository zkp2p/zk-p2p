import { createContext } from 'react'


interface RampValues {
  minimumDepositAmount: number;
  convenienceRewardTimePeriod: number;
  depositCounter: number;
}

const defaultValues: RampValues = {
  minimumDepositAmount: 0,
  convenienceRewardTimePeriod: 0,
  depositCounter: 0,
};

const RampContext = createContext<RampValues>(defaultValues)

export default RampContext
