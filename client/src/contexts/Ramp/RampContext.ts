import { createContext } from 'react'


interface RampValues {
  minimumDepositAmount: number;
}

const defaultValues: RampValues = {
  minimumDepositAmount: 0,
};

const RampContext = createContext<RampValues>(defaultValues)

export default RampContext
