import { createContext } from 'react'
import { Address } from 'wagmi';

import { ZERO_ADDRESS } from '../../helpers/constants'


interface SmartContractsValues {
  rampAddress: Address;
  usdcAddress: Address;
}

const defaultValues: SmartContractsValues = {
  rampAddress: ZERO_ADDRESS,
  usdcAddress: ZERO_ADDRESS
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
