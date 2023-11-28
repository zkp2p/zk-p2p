import { createContext } from 'react'
import { Address } from 'wagmi';

import { Abi } from './types'


interface SmartContractsValues {
  rampAddress: Address | null;
  rampAbi: Abi | null;
  registrationProcessorAddress: Address | null;
  sendProcessorAddress: Address | null;
  sendProcessorAbi: Abi | null;
  venmoNftAddress: Address | null;
  venmoNftAbi: Abi | null;
  usdcAddress: Address | null;
  usdcAbi?: Abi | null;
  blockscanUrl?: string | null;
}

const defaultValues: SmartContractsValues = {
  rampAddress: null,
  rampAbi: null,
  registrationProcessorAddress: null,
  sendProcessorAddress: null,
  sendProcessorAbi: null,
  venmoNftAddress: null,
  venmoNftAbi: null,
  usdcAddress: null,
  usdcAbi: null,
  blockscanUrl: null,
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
