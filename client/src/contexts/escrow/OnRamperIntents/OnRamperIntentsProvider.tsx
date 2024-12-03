import React, { useEffect, useState, ReactNode } from 'react';
import { useContractRead } from 'wagmi';

import { Intent, OnRamperIntent, StoredDeposit } from '@helpers/types/escrow';
import { esl, ZERO, ZERO_ADDRESS } from '@helpers/constants';
import useAccount from '@hooks/useAccount';
import useSmartContracts from '@hooks/useSmartContracts';
import useLiquidity from '@hooks/escrow/useLiquidity';

import OnRamperIntentsContext from './OnRamperIntentsContext';


interface ProvidersProps {
  children: ReactNode;
}

const OnRamperIntentsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { escrowAddress, escrowAbi } = useSmartContracts();
  const { depositStore } = useLiquidity();

  /*
   * State
   */

  const [currentIntentHash, setCurrentIntentHash] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<OnRamperIntent | null>(null);

  const [shouldFetchIntentHash, setShouldFetchIntentHash] = useState<boolean>(false);
  const [shouldFetchIntent, setShouldFetchIntent] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // getAccountIntents(address _account) external view returns (bytes32)
  const {
    data: intentHashRaw,
    refetch: refetchIntentHash,
  } = useContractRead({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'getAccountIntents',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchIntentHash,
  })

  // mapping(bytes32 => Intent) public intents;
  const {
    data: intentRaw,
  } = useContractRead({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'intents',
    args: [
      currentIntentHash
    ],
    enabled: shouldFetchIntent,
  })

  /*
   * Helpers
   */

  // function getVenmoIdByDepositId(storedDeposits: StoredDeposit[], depositId: bigint): string | null {
  //   // Find the StoredDeposit object with the matching depositId
  //   const matchingDeposit = storedDeposits.find(storedDeposit => storedDeposit.depositId === depositId);
    
  //   // esl && console.log('garanti_matchingDeposit: ', matchingDeposit);

  //   // If a matching deposit is found, return the venmoId, otherwise return null
  //   return matchingDeposit ? matchingDeposit.deposit.venmoId : null;
  // }

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('garanti_shouldFetchIntentHash_garanti_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (isLoggedIn && loggedInEthereumAddress) {
      esl && console.log('garanti_shouldFetchIntentHash_garanti_2');

      setShouldFetchIntentHash(true);
    } else {
      esl && console.log('garanti_shouldFetchIntentHash_garanti_3');

      setShouldFetchIntentHash(false);

      setCurrentIntentHash(null);
      setCurrentIntent(null)
    }
  }, [isLoggedIn, loggedInEthereumAddress]);

  useEffect(() => {
    esl && console.log('garanti_shouldFetchIntent_garanti_1');
    esl && console.log('checking currentIntentHash: ', currentIntentHash);
    
    if (currentIntentHash) {
      esl && console.log('garanti_shouldFetchIntent_garanti_2');

      setShouldFetchIntent(true);
    } else {
      esl && console.log('garanti_shouldFetchIntent_garanti_3');

      setShouldFetchIntent(false);
      
      setCurrentIntent(null);
    }
  }, [currentIntentHash]);

  useEffect(() => {
    esl && console.log('escrow_intentHashRaw_escrow_1');
    esl && console.log('checking intentHashRaw: ', intentHashRaw);
  
    if (intentHashRaw !== ZERO_ADDRESS) {
      esl && console.log('escrow_intentHashRaw_escrow_2');
      
      const intentHashProcessed = intentHashRaw as string;

      setCurrentIntentHash(intentHashProcessed);
    } else {
      esl && console.log('escrow_intentHashRaw_escrow_3');

      setCurrentIntentHash(null);
    }
  }, [intentHashRaw]);

  useEffect(() => {
    esl && console.log('garanti_intentRaw_garanti_1');
    esl && console.log('checking intentRaw: ', intentRaw);
    esl && console.log('checking depositStore: ', depositStore);
  
    if (intentRaw && depositStore && depositStore.length > 0) {
      esl && console.log('garanti_intentRaw_garanti_2');

      const intentData = intentRaw as any;
      const intentProcessed: Intent = {
        owner: intentData.owner,
        to: intentData.to,
        depositId: intentData.depositId,
        amount: intentData.amount,
        timestamp: intentData.timestamp,
        paymentVerifier: intentData.paymentVerifier,
      };

      const depositor = depositStore.find(deposit => deposit.depositId === intentProcessed.depositId)?.deposit.depositor;
      if (depositor) {
        const onRampIntentProcessed: OnRamperIntent = {
          intent: intentProcessed,
          depositor
        };
  
        setCurrentIntent(onRampIntentProcessed);
      } else {
        esl && console.log('garanti_intentRaw_garanti_3');

        setCurrentIntent(null);
      }
    } else {
      esl && console.log('garanti_intentRaw_garanti_3');

      setCurrentIntent(null);
    }
  }, [intentRaw, depositStore]);

  return (
    <OnRamperIntentsContext.Provider
      value={{
        currentIntentHash,
        currentIntent,
        refetchIntentHash,
        shouldFetchIntentHash
      }}
    >
      {children}
    </OnRamperIntentsContext.Provider>
  );
};

export default OnRamperIntentsProvider;
