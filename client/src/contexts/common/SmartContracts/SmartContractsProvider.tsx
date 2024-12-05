import React, { useEffect, useState, ReactNode } from 'react'
import { erc20ABI } from 'wagmi';

import { abi as legacyRampAbi } from "@helpers/abi/legacy/ramp.abi";
import { abi as nftAbi } from "@helpers/abi/legacy/nft.abi";

import { abi as venmoRampAbi } from "@helpers/abi/venmo/ramp.abi";
import { abi as sendProcessorAbi } from "@helpers/abi/venmo/send.abi";

import { abi as hdfcRampAbi } from "@helpers/abi/hdfc/ramp.abi";
import { abi as hdfcSendProcessorAbi } from "@helpers/abi/hdfc/send.abi";

import { abi as garantiRampAbi } from "@helpers/abi/garanti/ramp.abi";
import { abi as garantiSendProcessorAbi } from "@helpers/abi/garanti/send.abi";

import { abi as revolutRampAbi } from "@helpers/abi/revolut/ramp.abi";
import { abi as revolutSendProcessorAbi } from "@helpers/abi/revolut/send.abi";
import { abi as revolutAccountRegistryAbi } from "@helpers/abi/revolut/accountRegistry.abi";

import { abi as escrowAbi } from "@helpers/abi/escrow.abi";
import { abi as venmoReclaimVerifierAbi } from "@helpers/abi/venmoReclaimVerifier.abi";
import { abi as quoterAbi } from "@helpers/abi/quoter.abi";

import { contractAddresses, blockExplorerUrls } from "@helpers/deployed_addresses";
import { esl, DEFAULT_NETWORK } from '@helpers/constants';
import { Abi } from '@helpers/types';
import useAccount from '@hooks/useAccount'

import SmartContractsContext from './SmartContractsContext';


interface ProvidersProps {
  children: ReactNode;
}

const SmartContractsProvider = ({ children }: ProvidersProps) => {
  /*
   * Context
   */

  const { network, isLoggedIn } = useAccount();

  /*
   * State
   */

  const [usdcAddress, setUsdcAddress] = useState<string | null>(null);
  const [blockscanUrl, setBlockscanUrl] = useState<string>(blockExplorerUrls[DEFAULT_NETWORK]);

  // Legacy
  const [legacyRampAddress, setLegacyRampAddress] = useState<string | null>(null);
  const [legacyNftAddress, setLegacyNftAddress] = useState<string | null>(null);

  // Venmo
  const [venmoRampAddress, setVenmoRampAddress] = useState<string | null>(null);
  const [venmoSendProcessorAddress, setVenmoSendProcessorAddress] = useState<string | null>(null);
  const [venmoRegistrationProcessorAddress, setVenmoRegistrationProcessorAddress] = useState<string | null>(null);

  // HDFC
  const [hdfcRampAddress, setHdfcRampAddress] = useState<string | null>(null);
  const [hdfcSendProcessorAddress, setHdfcSendProcessorAddress] = useState<string | null>(null);

  // Garanti
  const [garantiRampAddress, setGarantiRampAddress] = useState<string | null>(null);
  const [garantiSendProcessorAddress, setGarantiSendProcessorAddress] = useState<string | null>(null);

  // Revolut
  const [revolutRampAddress, setRevolutRampAddress] = useState<string | null>(null);
  const [revolutSendProcessorAddress, setRevolutSendProcessorAddress] = useState<string | null>(null);
  const [revolutAccountRegistryAddress, setRevolutAccountRegistryAddress] = useState<string | null>(null);

  // Escrow
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);

  // Venmo Reclaim Verifier
  const [venmoReclaimVerifierAddress, setVenmoReclaimVerifierAddress] = useState<string | null>(null);

  // Quoter
  const [quoterAddress, setQuoterAddress] = useState<string | null>(null);

  // NFT
  const [venmoNftAddress, setVenmoNftAddress] = useState<string | null>(null);
  const [hdfcNftAddress, setHdfcNftAddress] = useState<string | null>(null);
  const [garantiNftAddress, setGarantiNftAddress] = useState<string | null>(null);
  const [revolutNftAddress, setRevolutNftAddress] = useState<string | null>(null);

  // Socket
  const [socketBridgeAddress, setSocketBridgeAddress] = useState<string | null>(null);
  
  // Socket
  const [lifiBridgeAddress, setLifiBridgeAddress] = useState<string | null>(null);

  // Gating Service
  const [gatingServiceAddress, setGatingServiceAddress] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('smartContracts_1');
    esl && console.log('checking network: ', network);
    esl && console.log('isLoggedIn: ', isLoggedIn);

    const deploymentEnvironment = process.env.DEPLOYMENT_ENVIRONMENT || 'LOCAL';

    let networkToUse = null;
    if (isLoggedIn) {
      networkToUse = network;
    } else {
      switch (deploymentEnvironment) {
        case 'PRODUCTION':
        case 'STAGING':
          networkToUse = 'base';
          break;

        default:
          networkToUse = 'sepolia';
      }
    }

    if (networkToUse) {
      switch (deploymentEnvironment) {
        case 'PRODUCTION':
          setAddressWithNetworkEnvKey(networkToUse, 'base_production');
          break;
  
        default:
          switch (networkToUse) {
            case 'base':
              setAddressWithNetworkEnvKey(networkToUse, 'base_staging');
              break;
  
            case 'sepolia':
              setAddressWithNetworkEnvKey(networkToUse, 'sepolia_staging');
              break;
  
            case 'hardhat':
            default:
              setAddressWithNetworkEnvKey(networkToUse, 'localhardhat');
              break;
          }
        }
    } else {
      setEmptyAddresses();
    }
  }, [network, isLoggedIn]);

  /*
   * Helpers
   */

  const setEmptyAddresses = () => {
    setBlockscanUrl(blockExplorerUrls['base']);
    setUsdcAddress(null);

    // Legacy
    setLegacyRampAddress(null);
    setLegacyNftAddress(null);

    // Venmo
    setVenmoRampAddress(null);
    setVenmoSendProcessorAddress(null);
    setVenmoRegistrationProcessorAddress(null);
    
    // Hdfc
    setHdfcRampAddress(null); 
    setHdfcSendProcessorAddress(null);

    // Garanti
    setGarantiRampAddress(null); 
    setGarantiSendProcessorAddress(null);

    // Revolut
    setRevolutRampAddress(null); 
    setRevolutSendProcessorAddress(null);
    setRevolutAccountRegistryAddress(null);

    // Escrow
    setEscrowAddress(null);

    // Venmo Reclaim Verifier
    setVenmoReclaimVerifierAddress(null);

    // Quoter
    setQuoterAddress(null);

    // NFT
    setVenmoNftAddress(null);
    setHdfcNftAddress(null);
    setGarantiNftAddress(null);
    setRevolutNftAddress(null);
    
    // Socket
    setSocketBridgeAddress(null);

    // Lifi
    setLifiBridgeAddress(null);

    // Gating Service
    setGatingServiceAddress(null);

    esl && console.log('Set venmoRampAddress: null');
  };

  const setAddressWithNetworkEnvKey = (network: string, networkEnvKey: string) => {
    const contractsForNetwork = contractAddresses[networkEnvKey];

    setBlockscanUrl(blockExplorerUrls[network]);
    setUsdcAddress(contractsForNetwork.usdc);

    // Legacy
    setLegacyRampAddress(contractsForNetwork.legacyRamp);
    setLegacyNftAddress(contractsForNetwork.legacyNft);

    // Venmo
    setVenmoRampAddress(contractsForNetwork.venmoRamp);
    setVenmoSendProcessorAddress(contractsForNetwork.venmoSendProcessor);
    setVenmoRegistrationProcessorAddress(contractsForNetwork.venmoRegistrationProcessor);
    
    // Hdfc
    setHdfcRampAddress(contractsForNetwork.hdfcRamp);
    setHdfcSendProcessorAddress(contractsForNetwork.hdfcSendProcessor);

    // Garanti
    setGarantiRampAddress(contractsForNetwork.garantiRamp);
    setGarantiSendProcessorAddress(contractsForNetwork.garantiSendProcessor);

    // Revolut
    setRevolutRampAddress(contractsForNetwork.revolutRamp);
    setRevolutSendProcessorAddress(contractsForNetwork.revolutSendProcessor);
    setRevolutAccountRegistryAddress(contractsForNetwork.revolutAccountRegistry);

    // Escrow
    setEscrowAddress(contractsForNetwork.escrow);

    // Venmo Reclaim Verifier
    setVenmoReclaimVerifierAddress(contractsForNetwork.venmoReclaimVerifier);

    // Quoter
    setQuoterAddress(contractsForNetwork.quoter);

    // NFT
    setVenmoNftAddress(contractsForNetwork.venmoNft);
    setHdfcNftAddress(contractsForNetwork.hdfcNft);
    setGarantiNftAddress(contractsForNetwork.garantiNft);
    setRevolutNftAddress(contractsForNetwork.revolutNft);

    // Socket
    setSocketBridgeAddress(contractsForNetwork.socketBridge);
    
    // Lifi
    setLifiBridgeAddress(contractsForNetwork.lifiBridge);

    // Gating Service
    setGatingServiceAddress(contractsForNetwork.gatingService);
  };

  return (
    <SmartContractsContext.Provider
      value={{
        usdcAddress,
        usdcAbi: erc20ABI as any,
        blockscanUrl: blockscanUrl,

        // Legacy
        legacyRampAddress,
        legacyRampAbi: legacyRampAbi as Abi,
        legacyNftAddress,

        // Venmo
        venmoRampAddress,
        venmoRampAbi: venmoRampAbi as Abi,
        venmoSendProcessorAddress,
        venmoSendProcessorAbi: sendProcessorAbi as Abi,
        venmoRegistrationProcessorAddress,

        // Hdfc
        hdfcRampAddress,
        hdfcRampAbi: hdfcRampAbi as Abi,
        hdfcSendProcessorAddress,
        hdfcSendProcessorAbi: hdfcSendProcessorAbi as Abi,

        // Garanti
        garantiRampAddress,
        garantiRampAbi: garantiRampAbi as Abi,
        garantiSendProcessorAddress,
        garantiSendProcessorAbi: garantiSendProcessorAbi as Abi,

        // Revolut
        revolutRampAddress,
        revolutRampAbi: revolutRampAbi as Abi,
        revolutSendProcessorAddress,
        revolutSendProcessorAbi: revolutSendProcessorAbi as Abi,
        revolutAccountRegistryAddress,
        revolutAccountRegistryAbi: revolutAccountRegistryAbi as Abi,


        // Escrow
        escrowAddress,
        escrowAbi: escrowAbi as Abi,  

        // Venmo Reclaim Verifier
        venmoReclaimVerifierAddress,
        venmoReclaimVerifierAbi: venmoReclaimVerifierAbi as Abi,

        // Quoter
        quoterAddress,
        quoterAbi: quoterAbi as Abi,

        // NFT
        nftAbi: nftAbi as Abi,
        venmoNftAddress,
        hdfcNftAddress,
        garantiNftAddress,
        revolutNftAddress,

        // Socket
        socketBridgeAddress,

        // Lifi
        lifiBridgeAddress,

        // Gating Service
        gatingServiceAddress,
      }}
    >
      {children}
    </SmartContractsContext.Provider>
  );
};

export default SmartContractsProvider;
