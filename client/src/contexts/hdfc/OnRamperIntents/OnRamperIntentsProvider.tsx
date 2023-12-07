import React, { useEffect, useState, ReactNode } from 'react';
import { useContractRead } from 'wagmi';

import { Intent, OnRamperIntent, StoredDeposit } from '../../venmo/Deposits/types';
import { esl, ZERO, ZERO_ADDRESS } from '@helpers/constants';
import useAccount from '@hooks/useAccount';
import useSmartContracts from '@hooks/useSmartContracts';
import useLiquidity from '@hooks/hdfc/useHdfcLiquidity';
import useRegistration from '@hooks/hdfc/useHdfcRegistration';

import OnRamperIntentsContext from './OnRamperIntentsContext';


interface ProvidersProps {
  children: ReactNode;
}

const OnRamperIntentsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { isRegistered } = useRegistration();
  const { hdfcRampAddress, hdfcRampAbi } = useSmartContracts();
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

  // getIdCurrentIntentHash(address _account) external view returns (bytes32)
  const {
    data: intentHashRaw,
    refetch: refetchIntentHash,
  } = useContractRead({
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
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
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
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
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
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
    
    // esl && console.log('matchingDeposit');
    // esl && console.log(matchingDeposit);

    // If a matching deposit is found, return the venmoId, otherwise return null
    return matchingDeposit ? matchingDeposit.deposit.venmoId : null;
  }

  /*
   * Hooks
   */

  useEffect(() => {
    console.log('shouldFetchIntentHash_hdfc_1');
    console.log('checking isLoggedIn: ', isLoggedIn);
    console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    console.log('checking isRegistered: ', isRegistered);

    if (isLoggedIn && loggedInEthereumAddress && isRegistered) {
      console.log('shouldFetchIntentHash_hdfc_2');

      setShouldFetchIntentHash(true);
    } else {
      console.log('shouldFetchIntentHash_hdfc_3');

      setShouldFetchIntentHash(false);

      setCurrentIntentHash(null);
      setCurrentIntent(null)
    }
  }, [isLoggedIn, loggedInEthereumAddress, isRegistered]);

  useEffect(() => {
    console.log('shouldFetchIntent_hdfc_1');
    console.log('checking currentIntentHash: ', currentIntentHash);
    
    if (currentIntentHash) {
      console.log('shouldFetchIntent_hdfc_2');

      setShouldFetchIntent(true);
    } else {
      console.log('shouldFetchIntent_hdfc_3');

      setShouldFetchIntent(false);
      
      setCurrentIntent(null);
    }
  }, [currentIntentHash]);

  useEffect(() => {
    console.log('intentHashRaw_hdfc_1');
    console.log('checking intentHashRaw: ', intentHashRaw);
  
    if (intentHashRaw !== ZERO_ADDRESS) {
      console.log('intentHashRaw_hdfc_2');
      
      const intentHashProcessed = intentHashRaw as string;

      setCurrentIntentHash(intentHashProcessed);
    } else {
      console.log('intentHashRaw_hdfc_3');

      setCurrentIntentHash(null);
    }
  }, [intentHashRaw]);

  useEffect(() => {
    console.log('lastOnRampTimeStampRaw_hdfc_1');
    console.log('checking lastOnRampTimeStampRaw: ', lastOnRampTimeStampRaw);
  
    if (lastOnRampTimeStampRaw || lastOnRampTimeStampRaw === ZERO) {
      console.log('lastOnRampTimeStampRaw_hdfc_2');

      setLastOnRampTimestamp(lastOnRampTimeStampRaw as bigint);
    } else {
      console.log('lastOnRampTimeStampRaw_hdfc_3');

      setLastOnRampTimestamp(null);
    }
  }, [lastOnRampTimeStampRaw]);

  useEffect(() => {
    console.log('intentRaw_hdfc_1');
    console.log('checking intentRaw: ', intentRaw);
    console.log('checking depositStore: ', depositStore);
  
    if (intentRaw && depositStore && depositStore.length > 0) {
      console.log('intentRaw_hdfc_2');

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
        console.log('intentRaw_hdfc_3');

        setCurrentIntent(null);
      }
    } else {
      console.log('intentRaw_hdfc_3');

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

export default OnRamperIntentsProvider;
