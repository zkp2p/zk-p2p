import { createContext } from 'react'
import { Address } from 'wagmi';

import { Abi } from './types'


interface SmartContractsValues {
  rampAddress: Address | null;
  rampAbi: Abi | null;
  registrationProcessorAddress: Address | null;
  // registrationProcessorAbi: Abi | null;
  sendProcessorAddress: Address | null;
  sendProcessorAbi: Abi | null;
  usdcAddress: Address | null;
  usdcAbi?: Abi | null;
  blockscanUrl?: string | null;
}

const defaultValues: SmartContractsValues = {
  rampAddress: null,
  rampAbi: null,
  registrationProcessorAddress: null,
  // registrationProcessorAbi: null,
  sendProcessorAddress: null,
  sendProcessorAbi: null,
  usdcAddress: null,
  usdcAbi: null,
  blockscanUrl: null,
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
