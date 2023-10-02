import React, { useEffect, useState, ReactNode } from 'react'
import { Address, erc20ABI } from 'wagmi';

import { abi as rampAbi } from "../../helpers/abi/ramp.abi";
import { abi as receiveProcessorAbi } from "../../helpers/abi/receive.abi";
import { abi as sendProcessorAbi } from "../../helpers/abi/send.abi";
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
  const [sendProcessorAddress, setSendProcessorAddress] = useState<Address>(ZERO_ADDRESS);
  const [receiveProcessorAddress, setReceiveProcessorAddress] = useState<Address>(ZERO_ADDRESS);
  const [registrationProcessorAddress, setRegistrationProcessorAddress] = useState<Address>(ZERO_ADDRESS);
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
        setSendProcessorAddress(contractsForNetwork.sendProcessor as Address);
        setReceiveProcessorAddress(contractsForNetwork.receiveProcessor as Address);
        setRegistrationProcessorAddress(contractsForNetwork.registrationProcessor as Address);
      } else {
        setRampAddress(ZERO_ADDRESS);
        setUsdcAddress(ZERO_ADDRESS);
        setSendProcessorAddress(ZERO_ADDRESS);
        setReceiveProcessorAddress(ZERO_ADDRESS);
        setRegistrationProcessorAddress(ZERO_ADDRESS);
      }
    } else {
      setRampAddress(ZERO_ADDRESS);
      setUsdcAddress(ZERO_ADDRESS);
      setSendProcessorAddress(ZERO_ADDRESS);
      setReceiveProcessorAddress(ZERO_ADDRESS);
      setRegistrationProcessorAddress(ZERO_ADDRESS);
    }
  }, [network]);

  return (
    <SmartContractsContext.Provider
      value={{
        rampAddress,
        rampAbi: rampAbi as Abi,
        receiveProcessorAddress,
        receiveProcessorAbi: receiveProcessorAbi as Abi,
        registrationProcessorAddress,
        sendProcessorAbi: sendProcessorAbi as Abi,
        sendProcessorAddress,
        usdcAddress,
        usdcAbi: erc20ABI as any,
      }}
    >
      {children}
    </SmartContractsContext.Provider>
  );
};

export default SmartContractsProvider
