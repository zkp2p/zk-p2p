import React, { useEffect, useState, ReactNode } from 'react';
import { useContractRead } from 'wagmi';

import {
  Deposit,
  DepositIntent,
  DepositView,
  Intent
} from '@helpers/types/escrow';
import { esl } from '@helpers/constants';
import useAccount from '@hooks/useAccount';
import useSmartContracts from '@hooks/useSmartContracts';

import DepositsContext from './DepositsContext';


interface ProvidersProps {
  children: ReactNode;
}

const DepositsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount();
  const { escrowAddress, escrowAbi } = useSmartContracts();
  // const { isRegistered } = useRegistration();

  /*
   * State
   */

  const [deposits, setDeposits] = useState<DepositView[] | null>(null);
  const [depositIntents, setDepositIntents] = useState<DepositIntent[] | null>(null);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);
  const [uniqueIntentHashes, setUniqueIntentHashes] = useState<string[]>([]);
  const [intentIndexDepositMap, setIntentIndexDepositMap] = useState<Map<number, Deposit>>(new Map<number, Deposit>())
  const [shouldFetchDepositIntents, setShouldFetchDepositIntents] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // function getAccountDeposits(address _account)
  const {
    data: depositsRaw,
    refetch: refetchDeposits,
  } = useContractRead({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'getAccountDeposits',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchDeposits,
  })
      
  // getIntentsWithIntentHash(bytes32[] calldata _intentHashes)
  const {
    data: depositIntentsRaw,
    refetch: refetchDepositIntents,
  } = useContractRead({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'getIntentsWithIntentHash',
    args: [
      uniqueIntentHashes
    ],
    enabled: shouldFetchDepositIntents,
  });

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('escrow_shouldFetchDeposits_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking escrowAddress: ', escrowAddress);

    if (isLoggedIn && loggedInEthereumAddress && escrowAddress) {
      esl && console.log('escrow_shouldFetchDeposits_2');

      setShouldFetchDeposits(true);
    } else {
      esl && console.log('escrow_shouldFetchDeposits_3');

      setShouldFetchDeposits(false);

      setDeposits(null);
      setDepositIntents(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, escrowAddress]);

  useEffect(() => {
    esl && console.log('escrow_shouldFetchDepositIntents_1');
    esl && console.log('checking uniqueIntentHashes: ', uniqueIntentHashes);

    if (uniqueIntentHashes.length > 0) {
      esl && console.log('escrow_shouldFetchDepositIntents_2');

      setShouldFetchDepositIntents(true);
    } else {
      esl && console.log('escrow_shouldFetchDepositIntents_3');

      setShouldFetchDepositIntents(false);

      setDepositIntents(null);
    }
  }, [uniqueIntentHashes]);

  useEffect(() => {
    esl && console.log('escrow_depositsRaw_1');
    esl && console.log('checking depositsRaw: ', depositsRaw);

    if (depositsRaw) {
      esl && console.log('escrow_depositsRaw_2');

      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: DepositView[] = [];
      const depositIntentHashes: string[][] = [];
      const intentHashToDepositMap = new Map<string, Deposit>();

      for (let i = depositsArrayRaw.length - 1; i >= 0; i--) {
        const depositView = depositsArrayRaw[i];

        const depositData = depositView.deposit;
        const deposit: Deposit = { 
          depositor: depositData.depositor.toString(),
          depositAmount: depositData.depositAmount,
          remainingDepositAmount: depositData.remainingDeposits,
          outstandingIntentAmount: depositData.outstandingIntentAmount,
          intentHashes: depositData.intentHashes,
          minIntentAmount: depositData.intentAmountRange.min,
          maxIntentAmount: depositData.intentAmountRange.max,
          token: depositData.token,
          verifiers: depositData.verifiers,
          acceptingIntents: depositData.acceptingIntents,
        };

        const depositWithLiquidity: DepositView = {
          deposit,
          availableLiquidity: depositView.availableLiquidity,
          depositId: depositView.depositId,
          verifiers: depositView.verifiers
        }

        sanitizedDeposits.push(depositWithLiquidity);
        depositIntentHashes.push(depositData.intentHashes);

        for (let j = 0; j < depositData.intentHashes.length; j++) {
          const intentHash = depositData.intentHashes[j];
          intentHashToDepositMap.set(intentHash, deposit);
        }
      }
          
      setDeposits(sanitizedDeposits);
      
      const flattenedDepositIntentHashes = depositIntentHashes.flat();
      setUniqueIntentHashes(flattenedDepositIntentHashes);

      const intentIndexDepositMap = new Map<number, Deposit>();
      for (let i = 0; i < flattenedDepositIntentHashes.length; i++) {
        const intentHash = flattenedDepositIntentHashes[i];
        const deposit = intentHashToDepositMap.get(intentHash);

        if (deposit === undefined) {
          throw new Error('Deposit not found for intent hash: ' + intentHash);
        } else {
          intentIndexDepositMap.set(i, deposit);
        }
      }
      setIntentIndexDepositMap(intentIndexDepositMap);
    } else {
      esl && console.log('escrow_depositsRaw_3');

      setDeposits(null);
      setUniqueIntentHashes([]);
    }
  }, [depositsRaw]);

  useEffect(() => {
    esl && console.log('escrow_depositsIntentsRaw_1');
    esl && console.log('checking depositIntentsRaw: ', depositIntentsRaw);

    if (depositIntentsRaw && depositIntentsRaw.length > 0) {
      esl && console.log('escrow_depositsIntentsRaw_2');

      const depositIntentsArray = depositIntentsRaw as any[];

      const sanitizedIntents: DepositIntent[] = [];
      for (let i = depositIntentsArray.length - 1; i >= 0; i--) {
        const intentWithIntentHash = depositIntentsArray[i];
        
        const intentData = intentWithIntentHash.intent;
        const intent: Intent = {
          owner: intentData.owner,
          to: intentData.to,
          depositId: intentData.depositId,
          amount: intentData.amount,
          timestamp: intentData.intentTimestamp,
          paymentVerifier: intentData.paymentVerifier,
        };  

        const deposit = intentIndexDepositMap.get(i);
        if (deposit === undefined) {
          throw new Error('Deposit not found for intent index: ' + i);
        }

        const intentHash = intentWithIntentHash.intentHash;
        const depositIntent: DepositIntent = {
          intent,
          deposit,
          intentHash
        }

        sanitizedIntents.push(depositIntent);
      }

      setDepositIntents(sanitizedIntents);
    } else {
      esl && console.log('escrow_depositsIntentsRaw_3');
      
      setDepositIntents([]);
    }
  }, [depositIntentsRaw, intentIndexDepositMap]);

  return (
    <DepositsContext.Provider
      value={{
        deposits,
        depositIntents,
        refetchDeposits,
        shouldFetchDeposits,
        refetchDepositIntents,
        shouldFetchDepositIntents,
      }}
    >
      {children}
    </DepositsContext.Provider>
  );
};

export default DepositsProvider;
