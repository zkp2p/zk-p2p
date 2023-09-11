import React, { useEffect, useState, ReactNode } from 'react'
import { Address, erc20ABI } from 'wagmi';

import { abi } from "../../helpers/abi/ramp.abi";
import { contractAddresses } from "../../helpers/deployed_addresses";
import { ZERO_ADDRESS } from '../../helpers/constants'
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
  const [rampAddress, setRampAddress] = useState<Address>(ZERO_ADDRESS);
  const [usdcAddress, setUsdcAddress] = useState<Address>(ZERO_ADDRESS);

  /*
   * Hooks
   */

  useEffect(() => {
    if (network) {
      let contractsForNetwork = contractAddresses[network];

      if (contractsForNetwork) {
        setRampAddress(contractsForNetwork.ramp as Address);
        setUsdcAddress(contractsForNetwork.fusdc as Address);
      } else {
        setRampAddress(ZERO_ADDRESS);
        setUsdcAddress(ZERO_ADDRESS);
      }
    } else {
      setRampAddress(ZERO_ADDRESS);
      setUsdcAddress(ZERO_ADDRESS);
    }
  }, [network]);

  return (
    <SmartContractsContext.Provider
      value={{
        rampAddress,
        rampAbi: abi as Abi,
        usdcAddress,
        usdcAbi: erc20ABI as any,
      }}
    >
      {children}
    </SmartContractsContext.Provider>
  );
};

export default SmartContractsProvider
