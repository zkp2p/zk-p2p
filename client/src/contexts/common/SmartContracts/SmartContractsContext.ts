import { createContext } from 'react';

import { Abi } from '@helpers/types';


interface SmartContractsValues {
  blockscanUrl?: string | null;
  usdcAddress: string | null;
  usdcAbi?: Abi | null;
  
  // legacy
  legacyRampAddress: string | null;
  legacyRampAbi: Abi | null;
  legacyNftAddress: string | null;

  // venmo
  venmoRampAddress: string | null;
  venmoRampAbi: Abi | null;
  venmoRegistrationProcessorAddress: string | null;
  venmoSendProcessorAddress: string | null;
  venmoSendProcessorAbi: Abi | null;
  
  // hdfc
  hdfcRampAddress: string | null;
  hdfcRampAbi: Abi | null;
  hdfcSendProcessorAddress: string | null;
  hdfcSendProcessorAbi: Abi | null;

  // nft
  nftAbi: Abi | null;
  venmoNftAddress: string | null;
  hdfcNftAddress: string | null;
}

const defaultValues: SmartContractsValues = {
  blockscanUrl: null,
  usdcAddress: null,
  usdcAbi: null,

  // legacy
  legacyRampAddress: null,
  legacyRampAbi: null,
  legacyNftAddress: null,
  
  // venmo
  venmoRampAddress: null,
  venmoRampAbi: null,
  venmoRegistrationProcessorAddress: null,
  venmoSendProcessorAddress: null,
  venmoSendProcessorAbi: null,
  
  // hdfc
  hdfcRampAddress: null,
  hdfcRampAbi: null,
  hdfcSendProcessorAddress: null,
  hdfcSendProcessorAbi: null,
  
  // nft
  nftAbi: null,
  venmoNftAddress: null,
  hdfcNftAddress: null,
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
