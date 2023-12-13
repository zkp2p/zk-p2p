import { createContext } from 'react'

import { Abi } from './types'


interface SmartContractsValues {
  blockscanUrl?: string | null;
  usdcAddress: string | null;
  usdcAbi?: Abi | null;
  
  // venmo
  rampAddress: string | null;
  rampAbi: Abi | null;
  registrationProcessorAddress: string | null;
  sendProcessorAddress: string | null;
  sendProcessorAbi: Abi | null;
  venmoNftAddress: string | null;
  venmoNftAbi: Abi | null;
  
  // hdfc
  hdfcRampAddress: string | null;
  hdfcRampAbi: Abi | null;
  hdfcSendProcessorAddress: string | null;
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
