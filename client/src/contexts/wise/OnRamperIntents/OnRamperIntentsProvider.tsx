import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { Deposit, Intent, OnRamperIntent, PaymentPlatform, StoredDeposit } from '@helpers/types';
import { esl, ZERO, ZERO_ADDRESS } from '@helpers/constants';
import useAccount from '@hooks/useAccount';
import useSmartContracts from '@hooks/useSmartContracts';
import useLiquidity from '@hooks/wise/useLiquidity';
import useRegistration from '@hooks/wise/useRegistration';
import useExtensionNotarizations from '@hooks/useExtensionNotarizations';

import OnRamperIntentsContext from './OnRamperIntentsContext'
import { toUsdcString } from '@helpers/units';


interface ProvidersProps {
  children: ReactNode;
}

const OnRamperIntentsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { postOnramperIntent } = useExtensionNotarizations();
  const { isRegistered } = useRegistration();
  const { wiseRampAddress, wiseRampAbi } = useSmartContracts();
  const { depositStore, calculateUsdFromRequestedUSDC } = useLiquidity();

  /*
   * State
   */

  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [currentIntentHashAsUint, setCurrentIntentHashAsUint] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<OnRamperIntent | null>(null);
  const [lastOnRampTimestamp, setLastOnRampTimestamp] = useState<bigint | null>(null);

  const [shouldFetchIntentHash, setShouldFetchIntentHash] = useState<boolean>(false);
  const [shouldFetchIntent, setShouldFetchIntent] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // getIdCurrentIntentHashAsUint(address _account) external view returns (bytes32)
  const {
    data: intentHashAsUintRaw,
    refetch: refetchIntentHashAsUint,
  } = useContractRead({
    address: wiseRampAddress,
    abi: wiseRampAbi,
    functionName: 'getIdCurrentIntentHashAsUint',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchIntentHash,
  });

    // getIdCurrentIntentHash(address _account) external view returns (bytes32)
    const {
      data: intentHashRaw,
      refetch: refetchIntentHash,
    } = useContractRead({
      address: wiseRampAddress,
      abi: wiseRampAbi,
      functionName: 'getIdCurrentIntentHash',
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
    address: wiseRampAddress,
    abi: wiseRampAbi,
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
    address: wiseRampAddress,
    abi: wiseRampAbi,
    functionName: 'intents',
    args: [
      currentIntentHash
    ],
    enabled: shouldFetchIntent,
  })

  /*
   * Helpers
   */

  function getDepositByDepositId(storedDeposits: StoredDeposit[], depositId: bigint): Deposit | null {
    // Find the StoredDeposit object with the matching depositId
    const matchingDeposit = storedDeposits.find(storedDeposit => storedDeposit.depositId === depositId);
    
    // esl && console.log('wise_matchingDeposit: ', matchingDeposit);

    // If a matching deposit is found, return the deposit, otherwise return null
    return matchingDeposit ? matchingDeposit.deposit : null;
  }

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('wise_shouldFetchIntentHash_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking isRegistered: ', isRegistered);

    if (isLoggedIn && loggedInEthereumAddress && isRegistered) {
      esl && console.log('wise_shouldFetchIntentHash_2');

      setShouldFetchIntentHash(true);
    } else {
      esl && console.log('wise_shouldFetchIntentHash_3');

      setShouldFetchIntentHash(false);

      setCurrentIntentHash(null);
      setCurrentIntent(null)
    }
  }, [isLoggedIn, loggedInEthereumAddress, isRegistered]);

  useEffect(() => {
    esl && console.log('wise_shouldFetchIntent_1');
    esl && console.log('checking currentIntentHash: ', currentIntentHash);
    
    if (currentIntentHash) {
      esl && console.log('wise_shouldFetchIntent_2');

      setShouldFetchIntent(true);
    } else {
      esl && console.log('wise_shouldFetchIntent_3');

      setShouldFetchIntent(false);
      
      setCurrentIntent(null);
    }
  }, [currentIntentHash]);

  useEffect(() => {
    esl && console.log('wise_intentHashRaw_1');
    esl && console.log('checking intentHashRaw: ', intentHashRaw);
  
    if (intentHashRaw !== ZERO_ADDRESS) {
      esl && console.log('wise_intentHashRaw_2');
      
      const intentHashProcessed = intentHashRaw as string;

      setCurrentIntentHash(intentHashProcessed);
    } else {
      esl && console.log('wise_intentHashRaw_3');

      setCurrentIntentHash(null);
    }
  }, [intentHashRaw]);

  useEffect(() => {
    esl && console.log('wise_intentHashAsUintRaw_1');
    esl && console.log('checking intentHashAsUintRaw: ', intentHashAsUintRaw);
  
    if (intentHashAsUintRaw !== ZERO_ADDRESS) {
      esl && console.log('wise_intentHashAsUintRaw_2');
      
      const intentHashAsUintProcessed = intentHashAsUintRaw as string;

      setCurrentIntentHashAsUint(intentHashAsUintProcessed);
    } else {
      esl && console.log('wise_intentHashAsUintRaw_3');

      setCurrentIntentHashAsUint(null);
    }
  }, [intentHashAsUintRaw]);

  useEffect(() => {
    esl && console.log('wise_lastOnRampTimeStampRaw_1');
    esl && console.log('checking lastOnRampTimeStampRaw: ', lastOnRampTimeStampRaw);
  
    if (lastOnRampTimeStampRaw || lastOnRampTimeStampRaw === ZERO) {
      esl && console.log('wise_lastOnRampTimeStampRaw_2');

      setLastOnRampTimestamp(lastOnRampTimeStampRaw as bigint);
    } else {
      esl && console.log('wise_lastOnRampTimeStampRaw_3');

      setLastOnRampTimestamp(null);
    }
  }, [lastOnRampTimeStampRaw]);

  useEffect(() => {
    esl && console.log('wise_intentRaw_1');
    esl && console.log('checking intentRaw: ', intentRaw);
    esl && console.log('checking depositStore: ', depositStore);
  
    if (intentRaw && depositStore && depositStore.length > 0) {
      esl && console.log('wise_intentRaw_2');

      const intentData = intentRaw as any;
      const intentProcessed: Intent = {
        onRamper: intentData[0],
        to: intentData[1],
        deposit: intentData[2],
        amount: intentData[3],
        timestamp: intentData[4],
      };

      const deposit = getDepositByDepositId(depositStore, intentProcessed.deposit);
      if (deposit) {
        const onRampIntentProcessed: OnRamperIntent = {
          intent: intentProcessed,
          depositorVenmoId: deposit.venmoId
        };
  
        setCurrentIntent(onRampIntentProcessed);
      } else {
        esl && console.log('wise_intentRaw_3');

        setCurrentIntent(null);
      }
    } else {
      esl && console.log('wise_intentRaw_4');

      setCurrentIntent(null);
    }
  }, [intentRaw, depositStore, postOnramperIntent]);

  useEffect(() => {
    esl && console.log('wise_postOnramperIntent_1');
  
    if (currentIntent && depositStore) {
      esl && console.log('wise_postOnramperIntent_2');
      const deposit = getDepositByDepositId(depositStore, currentIntent.intent.deposit);

      if (deposit) {
        const fiatToSendBigInt = calculateUsdFromRequestedUSDC(currentIntent.intent.amount, deposit.conversionRate);
        const fiatToSend = toUsdcString(fiatToSendBigInt);
        postOnramperIntent(
          PaymentPlatform.WISE,
          JSON.stringify(currentIntent),
          fiatToSend
        );
      }
    }
  }, [currentIntent, depositStore, postOnramperIntent]);

  return (
    <OnRamperIntentsContext.Provider
      value={{
        currentIntentHash,
        currentIntent,
        refetchIntentHash,
        currentIntentHashAsUint,
        refetchIntentHashAsUint,
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
