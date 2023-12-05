import React, { useEffect, useState, ReactNode } from 'react'
import { Address, erc20ABI } from 'wagmi';

import { abi as rampAbi } from "@helpers/abi/ramp.abi";
import { abi as sendProcessorAbi } from "@helpers/abi/send.abi";
import { abi as venmoNftAbi } from "@helpers/abi/venmoNft.abi";
import { abi as hdfcRampAbi } from "@helpers/abi/hdfc/ramp.abi";
import { abi as hdfcSendProcessorAbi } from "@helpers/abi/hdfc/send.abi";
import { contractAddresses, blockExplorerUrls } from "@helpers/deployed_addresses";
import { DEFAULT_NETWORK } from '@helpers/constants'
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
  const { network } = useAccount();

  /*
   * State
   */

  const [usdcAddress, setUsdcAddress] = useState<Address | null>(null);
  const [blockscanUrl, setBlockscanUrl] = useState<string>(blockExplorerUrls[DEFAULT_NETWORK]);

  // Venmo
  const [rampAddress, setRampAddress] = useState<Address | null>(null);
  const [sendProcessorAddress, setSendProcessorAddress] = useState<Address | null>(null);
  const [registrationProcessorAddress, setRegistrationProcessorAddress] = useState<Address | null>(null);
  const [venmoNftAddress, setVenmoNftAddress] = useState<Address | null>(null);

  // HDFC
  const [hdfcRampAddress, setHdfcRampAddress] = useState<Address | null>(null);
  const [hdfcSendProcessorAddress, setHdfcSendProcessorAddress] = useState<Address | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    const networkName = network ? network : DEFAULT_NETWORK;
    const deploymentEnvironment = process.env.DEPLOYMENT_ENVIRONMENT || 'LOCAL';

    let contractsForNetwork: { [contract: string]: string; };
    switch (deploymentEnvironment) {
      case 'PRODUCTION':
        contractsForNetwork = contractAddresses['base_production'];
        break;

      case 'STAGING':
      case 'LOCAL':
      default:
        switch (networkName) {
          case 'base':
            contractsForNetwork = contractAddresses['base_staging'];
            break;

          case 'goerli':
            contractsForNetwork = contractAddresses['goerli_staging'];
            break;

          case 'hardhat':
          default:
            contractsForNetwork = contractAddresses['localhardhat'];
            break;
        }
    };

    if (contractsForNetwork) {
      setBlockscanUrl(blockExplorerUrls[networkName]);
      setUsdcAddress(contractsForNetwork.fusdc as Address);

      // Venmo
      setRampAddress(contractsForNetwork.ramp as Address);
      setSendProcessorAddress(contractsForNetwork.sendProcessor as Address);
      setRegistrationProcessorAddress(contractsForNetwork.registrationProcessor as Address);
      setVenmoNftAddress(contractsForNetwork.proofOfP2pNft as Address);

      // Hdfc
      setHdfcRampAddress(contractsForNetwork.hdfcRamp as Address);
      setHdfcSendProcessorAddress(contractsForNetwork.hdfcSendProcessor as Address);
    } else {
      setBlockscanUrl(blockExplorerUrls[networkName]);
      setUsdcAddress(null);

      // Venmo
      setRampAddress(null);
      setSendProcessorAddress(null);
      setRegistrationProcessorAddress(null);
      setVenmoNftAddress(null);

      // Hdfc
      setHdfcRampAddress(null);
      setHdfcSendProcessorAddress(null);
    }
  }, [network]);

  return (
    <SmartContractsContext.Provider
      value={{
        usdcAddress,
        usdcAbi: erc20ABI as any,
        blockscanUrl: blockscanUrl,

        // Venmo
        rampAddress,
        rampAbi: rampAbi as Abi,
        registrationProcessorAddress,
        sendProcessorAbi: sendProcessorAbi as Abi,
        sendProcessorAddress,
        venmoNftAddress,
        venmoNftAbi: venmoNftAbi as Abi,

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

export default SmartContractsProvider
