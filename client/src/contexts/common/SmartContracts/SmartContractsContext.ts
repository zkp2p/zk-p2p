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

  // garanti
  garantiRampAddress: string | null;
  garantiRampAbi: Abi | null;
  garantiSendProcessorAddress: string | null;
  garantiSendProcessorAbi: Abi | null;

  // revolut
  revolutRampAddress: string | null;
  revolutRampAbi: Abi | null;
  revolutSendProcessorAddress: string | null;
  revolutSendProcessorAbi: Abi | null;
  revolutAccountRegistryAddress: string | null;
  revolutAccountRegistryAbi: Abi | null;


  // escrow
  escrowAddress: string | null;
  escrowAbi: Abi | null;

  // Venmo Reclaim Verifier
  venmoReclaimVerifierAddress: string | null;
  venmoReclaimVerifierAbi: Abi | null;

  // nft
  nftAbi: Abi | null;
  venmoNftAddress: string | null;
  hdfcNftAddress: string | null;
  garantiNftAddress: string | null;
  revolutNftAddress: string | null;

  // Socket
  socketBridgeAddress: string | null;

  // Lifi
  lifiBridgeAddress: string | null;

  // Gating Service
  gatingServiceAddress: string | null;
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

  // garanti
  garantiRampAddress: null,
  garantiRampAbi: null,
  garantiSendProcessorAddress: null,
  garantiSendProcessorAbi: null,

  // revolut
  revolutRampAddress: null,
  revolutRampAbi: null,
  revolutSendProcessorAddress: null,
  revolutSendProcessorAbi: null,
  revolutAccountRegistryAddress: null,
  revolutAccountRegistryAbi: null,

  // escrow
  escrowAddress: null,
  escrowAbi: null,

  // Venmo Reclaim Verifier
  venmoReclaimVerifierAddress: null,
  venmoReclaimVerifierAbi: null,

  // nft
  nftAbi: null,
  venmoNftAddress: null,
  hdfcNftAddress: null,
  garantiNftAddress: null,
  revolutNftAddress: null,

  // Socket
  socketBridgeAddress: null,

  // Lifi
  lifiBridgeAddress: null,

  // Gating Service
  gatingServiceAddress: null,
};

const SmartContractsContext = createContext<SmartContractsValues>(defaultValues)

export default SmartContractsContext
