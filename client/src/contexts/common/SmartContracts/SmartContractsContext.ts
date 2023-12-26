import { createContext } from 'react'

import { Abi } from './types'


interface SmartContractsValues {
  blockscanUrl?: string | null;
  usdcAddress: string | null;
  usdcAbi?: Abi | null;
  
  // legacy
  legacyRampAddress: string | null;
  legacyRampAbi: Abi | null;
  legacyNftAddress: string | null;
  legacyNftAbi: Abi | null;

  // venmo
  venmoRampAddress: string | null;
  venmoRampAbi: Abi | null;
  venmoRegistrationProcessorAddress: string | null;
  venmoSendProcessorAddress: string | null;
  venmoSendProcessorAbi: Abi | null;
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

  // legacy
  legacyRampAddress: null,
  legacyRampAbi: null,
  legacyNftAddress: null,
  legacyNftAbi: null,
  
  // venmo
  venmoRampAddress: null,
  venmoRampAbi: null,
  venmoRegistrationProcessorAddress: null,
  venmoSendProcessorAddress: null,
  venmoSendProcessorAbi: null,
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
