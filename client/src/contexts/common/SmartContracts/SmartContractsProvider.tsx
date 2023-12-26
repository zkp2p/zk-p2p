import React, { useEffect, useState, ReactNode } from 'react'
import { erc20ABI } from 'wagmi';

import { abi as legacyRampAbi } from "@helpers/abi/legacy/ramp.abi";
import { abi as legacyNftAbi } from "@helpers/abi/legacy/nft.abi";

import { abi as venmoRampAbi } from "@helpers/abi/venmo/ramp.abi";
import { abi as sendProcessorAbi } from "@helpers/abi/venmo/send.abi";

import { abi as hdfcRampAbi } from "@helpers/abi/hdfc/ramp.abi";
import { abi as hdfcSendProcessorAbi } from "@helpers/abi/hdfc/send.abi";
import { contractAddresses, blockExplorerUrls } from "@helpers/deployed_addresses";
import { esl, DEFAULT_NETWORK } from '@helpers/constants'
import useAccount from '@hooks/useAccount'

import SmartContractsContext from './SmartContractsContext'
import { Abi } from './types'


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
  const [venmoNftAddress, setVenmoNftAddress] = useState<string | null>(null);

  // HDFC
  const [hdfcRampAddress, setHdfcRampAddress] = useState<string | null>(null);
  const [hdfcSendProcessorAddress, setHdfcSendProcessorAddress] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('smartContracts_1');
    esl && console.log('checking network: ', network);
    esl && console.log('isLoggedIn: ', isLoggedIn);
    esl && console.log('accountStatus: ', accountStatus);
    esl && console.log('connectStatus: ', connectStatus);
    esl && console.log('disconnectStatus: ', disconnectStatus);

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

      const isAccountStatusValidTwo = accountStatus === 'disconnected'; 
      const isConnectStatusValidTwo = connectStatus === 'idle';
      const isDisconnectStatusValidTwo = disconnectStatus === 'idle';
      const validLoggedOutState = isAccountStatusValidTwo && isConnectStatusValidTwo && isDisconnectStatusValidTwo;

      if (validLoggedOutState) {
        networkToUse = DEFAULT_NETWORK;
      }
    } else {
      const isAccountStatusValid = accountStatus === 'connecting';
      const isConnectStatusValid = connectStatus === 'idle';
      const isDisconnectStatusValid = disconnectStatus === 'idle';
      const validLoggedInState = isAccountStatusValid && isConnectStatusValid && isDisconnectStatusValid;

      if (validLoggedInState) {
        networkToUse = DEFAULT_NETWORK;
      }
    }

    if (networkToUse) {
      switch (deploymentEnvironment) {
        case 'PRODUCTION':
          setAddressWithNetworkEnvKey('base_production');
          break;
  
        default:
          switch (networkToUse) {
            case 'base':
              setAddressWithNetworkEnvKey('base_staging');
              break;
  
            case 'goerli':
              setAddressWithNetworkEnvKey('goerli_staging');
              break;
  
            case 'hardhat':
            default:
              setAddressWithNetworkEnvKey('localhardhat');
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
    setVenmoNftAddress(null);

    // Hdfc
    setHdfcRampAddress(null); 
    setHdfcSendProcessorAddress(null);

    esl && console.log('Set venmoRampAddress: null');
  };

  const setAddressWithNetworkEnvKey = (networkEnvKey: string) => {
    const contractsForNetwork = contractAddresses[networkEnvKey];

    setBlockscanUrl(blockExplorerUrls[networkEnvKey]);
    setUsdcAddress(contractsForNetwork.fusdc);

    // Legacy
    setLegacyRampAddress(contractsForNetwork.legacyRamp);
    setLegacyNftAddress(contractsForNetwork.legacyNft);

    // Venmo
    setVenmoRampAddress(contractsForNetwork.venmoRamp);
    setVenmoSendProcessorAddress(contractsForNetwork.venmoSendProcessor);
    setVenmoRegistrationProcessorAddress(contractsForNetwork.venmoRegistrationProcessor);
    setVenmoNftAddress(null);

    // Hdfc
    setHdfcRampAddress(contractsForNetwork.hdfcRamp);
    setHdfcSendProcessorAddress(contractsForNetwork.hdfcSendProcessor);

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
        legacyNftAbi: legacyRampAbi as Abi,

        // Venmo
        venmoRampAddress,
        venmoRampAbi: venmoRampAbi as Abi,
        venmoSendProcessorAddress,
        venmoSendProcessorAbi: sendProcessorAbi as Abi,
        venmoNftAddress,
        venmoNftAbi: legacyNftAbi as Abi,
        venmoRegistrationProcessorAddress,

        // Hdfc
        hdfcRampAddress: hdfcRampAddress,
        hdfcRampAbi: hdfcRampAbi as Abi,
        hdfcSendProcessorAddress: hdfcSendProcessorAddress,
        hdfcSendProcessorAbi: hdfcSendProcessorAbi as Abi
      }}
    >
      {children}
    </SmartContractsContext.Provider>
  );
};

export default SmartContractsProvider;
