import { createContext } from 'react'
import { Address } from 'wagmi';

import { ZERO_ADDRESS } from '../../helpers/constants'
import { Abi } from './types'


interface SmartContractsValues {
  rampAddress: Address;
  rampAbi: Abi;
  usdcAddress: Address;
  usdcAbi?: Abi;
}

const defaultValues: SmartContractsValues = {
  rampAddress: ZERO_ADDRESS,
  rampAbi: [],
  usdcAddress: ZERO_ADDRESS,
  usdcAbi: [],
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
