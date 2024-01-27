import React, { useEffect, useState, ReactNode } from 'react'
import { erc20ABI } from 'wagmi';

import { abi as legacyRampAbi } from "@helpers/abi/legacy/ramp.abi";
import { abi as nftAbi } from "@helpers/abi/legacy/nft.abi";

import { abi as venmoRampAbi } from "@helpers/abi/venmo/ramp.abi";
import { abi as sendProcessorAbi } from "@helpers/abi/venmo/send.abi";

import { abi as hdfcRampAbi } from "@helpers/abi/hdfc/ramp.abi";
import { abi as hdfcSendProcessorAbi } from "@helpers/abi/hdfc/send.abi";
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

  const { network, isLoggedIn, accountStatus, connectStatus, disconnectStatus } = useAccount();

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

  // NFT
  const [venmoNftAddress, setVenmoNftAddress] = useState<string | null>(null);
  const [hdfcNftAddress, setHdfcNftAddress] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    console.log('smartContracts_1');
    console.log('checking network: ', network);
    console.log('isLoggedIn: ', isLoggedIn);
    console.log('accountStatus: ', accountStatus);
    console.log('connectStatus: ', connectStatus);
    console.log('disconnectStatus: ', disconnectStatus);

    const deploymentEnvironment = process.env.DEPLOYMENT_ENVIRONMENT || 'LOCAL';

    let networkToUse = null;
    if (isLoggedIn) {
      const isAccountStatusValid = accountStatus === 'connected';
      const isConnectStatusValid = connectStatus === 'idle';
      const isDisconnectStatusValid = disconnectStatus === 'success' || disconnectStatus === 'idle';

      const validLoggedInState = isAccountStatusValid && isConnectStatusValid && isDisconnectStatusValid;

      if (validLoggedInState) {
        networkToUse = network;
      }
    } else {
      const isAccountStatusValid = accountStatus === 'disconnected';
      const isConnectStatusValid = connectStatus === 'idle';
      const isDisconnectStatusValid = disconnectStatus === 'success' || disconnectStatus === 'idle';

      const validLoggedOutState = isAccountStatusValid && isConnectStatusValid && isDisconnectStatusValid;

      if (validLoggedOutState) {
        networkToUse = DEFAULT_NETWORK;
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
  }, [network, isLoggedIn, accountStatus, connectStatus, disconnectStatus]);

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
    
    // NFT
    setVenmoNftAddress(null);
    setHdfcNftAddress(null);

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

    // NFT
    setVenmoNftAddress(contractsForNetwork.venmoNft);
    setHdfcNftAddress(contractsForNetwork.hdfcNft);

    esl && console.log('Set venmoRampAddress to: ', contractsForNetwork.ramp);
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

        // NFT
        nftAbi: nftAbi as Abi,
        venmoNftAddress,
        hdfcNftAddress
      }}
    >
      {children}
    </SmartContractsContext.Provider>
  );
};

export default SmartContractsProvider;
