import React, { useEffect, useState, ReactNode } from 'react'
import { Address, erc20ABI } from 'wagmi';

import { abi as rampAbi } from "@helpers/abi/ramp.abi";
import { abi as sendProcessorAbi } from "@helpers/abi/send.abi";
import { abi as venmoNftAbi } from "@helpers/abi/venmoNft.abi";
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
  const [rampAddress, setRampAddress] = useState<Address | null>(null);
  const [sendProcessorAddress, setSendProcessorAddress] = useState<Address | null>(null);
  const [registrationProcessorAddress, setRegistrationProcessorAddress] = useState<Address | null>(null);
  const [venmoNftAddress, setVenmoNftAddress] = useState<Address | null>(null);
  const [usdcAddress, setUsdcAddress] = useState<Address | null>(null);
  const [blockscanUrl, setBlockscanUrl] = useState<string>(blockExplorerUrls[DEFAULT_NETWORK]);

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
      setRampAddress(contractsForNetwork.ramp as Address);
      setUsdcAddress(contractsForNetwork.fusdc as Address);
      setSendProcessorAddress(contractsForNetwork.sendProcessor as Address);
      setRegistrationProcessorAddress(contractsForNetwork.registrationProcessor as Address);
      setVenmoNftAddress(contractsForNetwork.proofOfVenmoNFT as Address);
      setBlockscanUrl(blockExplorerUrls[networkName]);
    } else {
      setRampAddress(null);
      setUsdcAddress(null);
      setSendProcessorAddress(null);
      setRegistrationProcessorAddress(null);
      setVenmoNftAddress(null);
      setBlockscanUrl(blockExplorerUrls[networkName]);
    }
  }, [network]);

  return (
    <SmartContractsContext.Provider
      value={{
        rampAddress,
        rampAbi: rampAbi as Abi,
        registrationProcessorAddress,
        sendProcessorAbi: sendProcessorAbi as Abi,
        sendProcessorAddress,
        venmoNftAddress,
        venmoNftAbi: venmoNftAbi as Abi,
        usdcAddress,
        usdcAbi: erc20ABI as any,
        blockscanUrl: blockscanUrl,
      }}
    >
      {children}
    </SmartContractsContext.Provider>
  );
};

export default SmartContractsProvider
