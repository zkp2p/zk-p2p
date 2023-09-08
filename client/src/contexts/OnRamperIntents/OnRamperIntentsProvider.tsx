import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { Intent } from '../Deposits/types'
import useAccount from '@hooks/useAccount'
import useRegistration from '@hooks/useRegistration'
import useSmartContracts from '@hooks/useSmartContracts';

import OnRamperIntentsContext from './OnRamperIntentsContext'


interface ProvidersProps {
  children: ReactNode;
}

const OnRamperIntentsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */
  const { isLoggedIn } = useAccount()
  const { registrationHash } = useRegistration()
  const { rampAddress, rampAbi } = useSmartContracts()

  /*
   * State
   */
  const [currentIntentHash, setCurrentIntentHash] = useState<string>('');
  const [currentIntent, setCurrentIntent] = useState<Intent>({} as Intent);

  /*
   * Contract Reads
   */

  // mapping(bytes32 => bytes32) public venmoIdIntent;
  const {
    data: intentHashRaw,
    isLoading: isFetchIntentHashLoading,
    isError: isFetchIntentHashError,
    // refetch: refetchIntentHash,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'venmoIdIntent',
    args: [registrationHash],
  })

  // mapping(bytes32 => Intent) public intents;
  const {
    data: intentRaw,
    isLoading: isFetchIntentLoading,
    isError: isFetchIntentError,
    // refetch: refetchIntent,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'intents',
    args: [currentIntentHash],
  })

  /*
   * Hooks
   */

  useEffect(() => {
    console.log('intentHashRaw_1');
    console.log(intentHashRaw);
  
    if (isLoggedIn && intentHashRaw) {
      const intentHashProcessed = intentHashRaw as string;
      console.log('intentHashProcessed');
      console.log(intentHashProcessed);

      setCurrentIntentHash(intentHashProcessed);
    } else {
      setCurrentIntentHash("");
    }
  }, [isLoggedIn, registrationHash, intentHashRaw]);

  useEffect(() => {
    console.log('intentRaw_1');
    console.log(intentRaw);
  
    if (isLoggedIn && registrationHash && intentRaw) {
      const intentData = intentRaw as any;
      const intentProcessed: Intent = {
        onRamper: intentData.onramper,
        deposit: intentData.deposit,
        amount: intentData.amount,
        timestamp: intentData.intentTimestamp,
      };
      console.log('intentProcessed');
      console.log(intentProcessed);

      setCurrentIntent(intentProcessed);
    } else {
      setCurrentIntent({} as Intent);
    }
  }, [isLoggedIn, registrationHash, intentRaw]);

  return (
    <OnRamperIntentsContext.Provider
      value={{
        currentIntentHash,
        currentIntent,
      }}
    >
      {children}
    </OnRamperIntentsContext.Provider>
  );
};

export default OnRamperIntentsProvider
