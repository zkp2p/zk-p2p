import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { Intent } from '../Deposits/types'
import useAccount from '@hooks/useAccount'
import useRegistration from '@hooks/useRegistration'
import useSmartContracts from '@hooks/useSmartContracts';
import { ZERO, ZERO_ADDRESS } from '@helpers/constants'

import OnRamperIntentsContext from './OnRamperIntentsContext'


interface ProvidersProps {
  children: ReactNode;
}

const OnRamperIntentsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount()
  const { registrationHash } = useRegistration()
  const { rampAddress, rampAbi } = useSmartContracts()

  /*
   * State
   */

  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);

  const [shouldFetchIntentHash, setShouldFetchIntentHash] = useState<boolean>(false);
  const [shouldFetchIntent, setShouldFetchIntent] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // mapping(bytes32 => bytes32) public venmoIdIntent;
  const {
    data: intentHashRaw,
    // isLoading: isFetchIntentHashLoading,
    // isError: isFetchIntentHashError,
    refetch: refetchIntentHash,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'venmoIdIntent',
    args: [
      registrationHash
    ],
    enabled: shouldFetchIntentHash,
  })

  // mapping(bytes32 => Intent) public intents;
  const {
    data: intentRaw,
    // isLoading: isFetchIntentLoading,
    // isError: isFetchIntentError,
    // refetch: refetchIntent,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'intents',
    args: [
      currentIntentHash
    ],
    enabled: shouldFetchIntent,
  })

  /*
   * Hooks
   */

  useEffect(() => {
    // console.log('shouldFetchIntentHash_1');
    if (isLoggedIn && loggedInEthereumAddress && registrationHash) {
      // console.log('shouldFetchIntentHash_2');
      setShouldFetchIntentHash(true);
    } else {
      // console.log('shouldFetchIntentHash_3');
      setShouldFetchIntentHash(false);

      setCurrentIntentHash(null);
      setCurrentIntent(null)
    }
  }, [isLoggedIn, loggedInEthereumAddress, registrationHash]);

  useEffect(() => {
    // console.log('shouldFetchIntent_1');
    if (currentIntentHash) {
      // console.log('shouldFetchIntent_2');

      setShouldFetchIntent(true);
    } else {
      // console.log('shouldFetchIntent_3');
      setShouldFetchIntent(false);
      
      setCurrentIntent(null);
    }
  }, [currentIntentHash]);

  useEffect(() => {
    // console.log('intentHashRaw_1');
  
    if (intentHashRaw !== ZERO_ADDRESS) {
      // console.log('intentHashRaw_2');
      // console.log(intentHashRaw);
      
      const intentHashProcessed = intentHashRaw as string;

      setCurrentIntentHash(intentHashProcessed);
    } else {
      // console.log('intentHashRaw_3');
      setCurrentIntentHash(null);
    }
  }, [intentHashRaw]);

  useEffect(() => {
    // console.log('intentRaw_1');
  
    if (intentRaw) {
      // console.log('intentRaw_2');
      // console.log(intentRaw);

      const intentData = intentRaw as any;
      const intentProcessed: Intent = {
        onRamper: intentData[0],
        to: intentData[1],
        deposit: intentData[2],
        amount: intentData[3],
        timestamp: intentData[4],
      };

      setCurrentIntent(intentProcessed);
    } else {
      // console.log('intentRaw_3');
      setCurrentIntent(null);
    }
  }, [intentRaw]);

  return (
    <OnRamperIntentsContext.Provider
      value={{
        currentIntentHash,
        currentIntent,
        refetchIntentHash
      }}
    >
      {children}
    </OnRamperIntentsContext.Provider>
  );
};

export default OnRamperIntentsProvider
