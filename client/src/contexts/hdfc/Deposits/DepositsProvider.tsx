import React, { useEffect, useState, ReactNode } from 'react';
import { useContractRead } from 'wagmi';

import {
  Deposit,
  DepositIntent,
  DepositWithAvailableLiquidity,
  Intent
} from '../../venmo/Deposits/types';
import { PaymentPlatform } from '../../common/PlatformSettings/types'
import { esl } from '@helpers/constants';
import { unpackPackedVenmoId } from '@helpers/poseidonHash';
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
  const { hdfcRampAddress, hdfcRampAbi } = useSmartContracts();

  /*
   * State
   */

  const [deposits, setDeposits] = useState<DepositWithAvailableLiquidity[] | null>(null);
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
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
    functionName: 'getAccountDeposits',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchDeposits,
  })
      
  // getIntentsWithOnRamperId(bytes32[] calldata _intentHashes)
  const {
    data: depositIntentsRaw,
    refetch: refetchDepositIntents,
  } = useContractRead({
    address: hdfcRampAddress,
    abi: hdfcRampAbi,
    functionName: 'getIntentsWithOnRamperId',
    args: [
      uniqueIntentHashes
    ],
    enabled: shouldFetchDepositIntents,
  });

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('shouldFetchDeposits_1');
    esl && console.log('checking isLoggedIn: ', isLoggedIn);
    esl && console.log('checking loggedInEthereumAddress: ', loggedInEthereumAddress);
    esl && console.log('checking hdfcRampAddress: ', hdfcRampAddress);

    if (isLoggedIn && loggedInEthereumAddress && hdfcRampAddress) {
      esl && console.log('shouldFetchDeposits_2');

      setShouldFetchDeposits(true);
    } else {
      esl && console.log('shouldFetchDeposits_3');

      setShouldFetchDeposits(false);

      setDeposits(null);
      setDepositIntents(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, hdfcRampAddress]);

  useEffect(() => {
    esl && console.log('shouldFetchDepositIntents_1');
    esl && console.log('checking uniqueIntentHashes: ', uniqueIntentHashes);

    if (uniqueIntentHashes.length > 0) {
      esl && console.log('shouldFetchDepositIntents_2');

      setShouldFetchDepositIntents(true);
    } else {
      esl && console.log('shouldFetchDepositIntents_3');

      setShouldFetchDepositIntents(false);

      setDepositIntents(null);
    }
  }, [uniqueIntentHashes]);

  useEffect(() => {
    esl && console.log('depositsRaw_1');
    esl && console.log('checking depositsRaw: ', depositsRaw);

    if (depositsRaw) {
      esl && console.log('depositsRaw_2');

      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: DepositWithAvailableLiquidity[] = [];
      const depositIntentHashes: string[][] = [];
      const intentHashToDepositMap = new Map<string, Deposit>();

      for (let i = depositsArrayRaw.length - 1; i >= 0; i--) {
        const depositWithAvailableLiquidityData = depositsArrayRaw[i];

        const depositData = depositWithAvailableLiquidityData.deposit;
        const deposit: Deposit = {
          platformType: PaymentPlatform.VENMO,
          depositor: depositData.depositor.toString(),
          venmoId: unpackPackedVenmoId(depositData.upiId),
          depositAmount: depositData.depositAmount,
          remainingDepositAmount: depositData.remainingDeposits,
          outstandingIntentAmount: depositData.outstandingIntentAmount,
          conversionRate: depositData.conversionRate,
          intentHashes: depositData.intentHashes,
        };

        const depositWithLiquidity: DepositWithAvailableLiquidity = {
          deposit,
          availableLiquidity: depositWithAvailableLiquidityData.availableLiquidity,
          depositId: depositWithAvailableLiquidityData.depositId,
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
      esl && console.log('depositsRaw_3');

      setDeposits(null);
      setUniqueIntentHashes([]);
    }
  }, [depositsRaw]);

  useEffect(() => {
    esl && console.log('depositsIntentsRaw_1');
    esl && console.log('checking depositIntentsRaw: ', depositIntentsRaw);

    if (depositIntentsRaw && depositIntentsRaw.length > 0) {
      esl && console.log('depositsIntentsRaw_2');

      const depositIntentsArray = depositIntentsRaw as any[];

      const sanitizedIntents: DepositIntent[] = [];
      for (let i = depositIntentsArray.length - 1; i >= 0; i--) {
        const intentWithOnRamperId = depositIntentsArray[i];
        
        const intentData = intentWithOnRamperId.intent;
        const intent: Intent = {
          onRamper: intentData.onRamper,
          to: intentData.to,
          deposit: intentData.deposit,
          amount: intentData.amount,
          timestamp: intentData.intentTimestamp,
        };

        const deposit = intentIndexDepositMap.get(i);
        if (deposit === undefined) {
          throw new Error('Deposit not found for intent index: ' + i);
        }

        const onRamperVenmoHash = intentWithOnRamperId.onRamperIdHash;
        const depositIntent: DepositIntent = {
          intent,
          onRamperVenmoHash,
          deposit
        }

        sanitizedIntents.push(depositIntent);
      }

      setDepositIntents(sanitizedIntents);
    } else {
      esl && console.log('depositsIntentsRaw_3');
      
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

export default DepositsProvider
