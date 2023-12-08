import { createContext } from 'react'
import { Address } from 'wagmi';

import { Abi } from './types'


interface SmartContractsValues {
  blockscanUrl?: string | null;
  usdcAddress: Address | null;
  usdcAbi?: Abi | null;
  
  // venmo
  rampAddress: Address | null;
  rampAbi: Abi | null;
  registrationProcessorAddress: Address | null;
  sendProcessorAddress: Address | null;
  sendProcessorAbi: Abi | null;
  venmoNftAddress: Address | null;
  venmoNftAbi: Abi | null;
  
  // hdfc
  hdfcRampAddress: Address | null;
  hdfcRampAbi: Abi | null;
  hdfcSendProcessorAddress: Address | null;
  hdfcSendProcessorAbi: Abi | null;
}

const defaultValues: SmartContractsValues = {
  blockscanUrl: null,
  usdcAddress: null,
  usdcAbi: null,
  
  // venmo
  rampAddress: null,
  rampAbi: null,
  registrationProcessorAddress: null,
  sendProcessorAddress: null,
  sendProcessorAbi: null,
  venmoNftAddress: null,
  venmoNftAbi: null,
  
  // hdfc
  hdfcRampAddress: null,
  hdfcRampAbi: null,
  hdfcSendProcessorAddress: null,
  hdfcSendProcessorAbi: null,
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
