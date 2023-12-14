import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { Intent, OnRamperIntent, StoredDeposit } from '../Deposits/types';
import { esl, ZERO, ZERO_ADDRESS } from '@helpers/constants';
import useAccount from '@hooks/useAccount';
import useSmartContracts from '@hooks/useSmartContracts';
import useLiquidity from '@hooks/useLiquidity';
import useRegistration from '@hooks/useRegistration';

import OnRamperIntentsContext from './OnRamperIntentsContext'


interface ProvidersProps {
  children: ReactNode;
}

const OnRamperIntentsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { isRegistered } = useRegistration();
  const { venmoRampAddress, venmoRampAbi } = useSmartContracts();
  const { depositStore } = useLiquidity();

  /*
   * State
   */

  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<OnRamperIntent | null>(null);
  const [lastOnRampTimestamp, setLastOnRampTimestamp] = useState<bigint | null>(null);

  const [shouldFetchIntentHash, setShouldFetchIntentHash] = useState<boolean>(false);
  const [shouldFetchIntent, setShouldFetchIntent] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // getVenmoIdCurrentIntentHash(address _account) external view returns (bytes32)
  const {
    data: intentHashRaw,
    refetch: refetchIntentHash,
  } = useContractRead({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'getVenmoIdCurrentIntentHash',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchIntentHash,
  })

  // function getLastOnRampTimestamp(address _account) external view returns (uint256)
  const {
    data: lastOnRampTimeStampRaw,
    refetch: refetchLastOnRampTimestamp,
  } = useContractRead({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'getLastOnRampTimestamp',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchIntentHash,
  })

  // mapping(bytes32 => Intent) public intents;
  const {
    data: intentRaw,
  } = useContractRead({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'intents',
    args: [
      currentIntentHash
    ],
    enabled: shouldFetchIntent,
  })

  /*
   * Helpers
   */

  function getVenmoIdByDepositId(storedDeposits: StoredDeposit[], depositId: bigint): string | null {
    // Find the StoredDeposit object with the matching depositId
    const matchingDeposit = storedDeposits.find(storedDeposit => storedDeposit.depositId === depositId);
    
    // esl && console.log('venmo_matchingDeposit: ', matchingDeposit);

    // If a matching deposit is found, return the venmoId, otherwise return null
    return matchingDeposit ? matchingDeposit.deposit.venmoId : null;
  }

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('venmo_shouldFetchIntentHash_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking isRegistered: ', isRegistered);

    if (isLoggedIn && loggedInEthereumAddress && isRegistered) {
      esl && console.log('venmo_shouldFetchIntentHash_2');

      setShouldFetchIntentHash(true);
    } else {
      esl && console.log('venmo_shouldFetchIntentHash_3');

      setShouldFetchIntentHash(false);

      setCurrentIntentHash(null);
      setCurrentIntent(null)
    }
  }, [isLoggedIn, loggedInEthereumAddress, isRegistered]);

  useEffect(() => {
    esl && console.log('venmo_shouldFetchIntent_1');
    esl && console.log('checking currentIntentHash: ', currentIntentHash);
    
    if (currentIntentHash) {
      esl && console.log('venmo_shouldFetchIntent_2');

      setShouldFetchIntent(true);
    } else {
      esl && console.log('venmo_shouldFetchIntent_3');

      setShouldFetchIntent(false);
      
      setCurrentIntent(null);
    }
  }, [currentIntentHash]);

  useEffect(() => {
    esl && console.log('venmo_intentHashRaw_1');
    esl && console.log('checking intentHashRaw: ', intentHashRaw);
  
    if (intentHashRaw !== ZERO_ADDRESS) {
      esl && console.log('venmo_intentHashRaw_2');
      
      const intentHashProcessed = intentHashRaw as string;

      setCurrentIntentHash(intentHashProcessed);
    } else {
      esl && console.log('venmo_intentHashRaw_3');

      setCurrentIntentHash(null);
    }
  }, [intentHashRaw]);

  useEffect(() => {
    esl && console.log('venmo_lastOnRampTimeStampRaw_1');
    esl && console.log('checking lastOnRampTimeStampRaw: ', lastOnRampTimeStampRaw);
  
    if (lastOnRampTimeStampRaw || lastOnRampTimeStampRaw === ZERO) {
      esl && console.log('venmo_lastOnRampTimeStampRaw_2');

      setLastOnRampTimestamp(lastOnRampTimeStampRaw as bigint);
    } else {
      esl && console.log('venmo_lastOnRampTimeStampRaw_3');

      setLastOnRampTimestamp(null);
    }
  }, [lastOnRampTimeStampRaw]);

  useEffect(() => {
    esl && console.log('venmo_intentRaw_1');
    esl && console.log('checking intentRaw: ', intentRaw);
    esl && console.log('checking depositStore: ', depositStore);
  
    if (intentRaw && depositStore && depositStore.length > 0) {
      esl && console.log('venmo_intentRaw_2');

      const intentData = intentRaw as any;
      const intentProcessed: Intent = {
        onRamper: intentData[0],
        to: intentData[1],
        deposit: intentData[2],
        amount: intentData[3],
        timestamp: intentData[4],
      };

      const depositorVenmoId = getVenmoIdByDepositId(depositStore, intentProcessed.deposit);
      if (depositorVenmoId) {
        const onRampIntentProcessed: OnRamperIntent = {
          intent: intentProcessed,
          depositorVenmoId: depositorVenmoId
        };
  
        setCurrentIntent(onRampIntentProcessed);
      } else {
        esl && console.log('venmo_intentRaw_3');

        setCurrentIntent(null);
      }
    } else {
      esl && console.log('venmo_intentRaw_4');

      setCurrentIntent(null);
    }
  }, [intentRaw, depositStore]);

  return (
    <OnRamperIntentsContext.Provider
      value={{
        currentIntentHash,
        currentIntent,
        refetchIntentHash,
        lastOnRampTimestamp,
        refetchLastOnRampTimestamp,
        shouldFetchIntentHash
      }}
    >
      {children}
    </OnRamperIntentsContext.Provider>
  );
};

export default OnRamperIntentsProvider
