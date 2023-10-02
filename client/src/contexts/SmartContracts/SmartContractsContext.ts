import { createContext } from 'react'
import { Address } from 'wagmi';

import { ZERO_ADDRESS } from '../../helpers/constants'
import { Abi } from './types'


interface SmartContractsValues {
  rampAddress: Address;
  rampAbi: Abi;
  registrationProcessorAddress: Address;
  // registrationProcessorAbi: Abi;
  sendProcessorAddress: Address;
  sendProcessorAbi: Abi;
  receiveProcessorAddress: Address;
  receiveProcessorAbi: Abi;
  usdcAddress: Address;
  usdcAbi?: Abi;
}

const defaultValues: SmartContractsValues = {
  rampAddress: ZERO_ADDRESS,
  rampAbi: [],
  registrationProcessorAddress: ZERO_ADDRESS,
  // registrationProcessorAbi: [],
  sendProcessorAddress: ZERO_ADDRESS,
  sendProcessorAbi: [],
  receiveProcessorAddress: ZERO_ADDRESS,
  receiveProcessorAbi: [],
  usdcAddress: ZERO_ADDRESS,
  usdcAbi: [],
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
