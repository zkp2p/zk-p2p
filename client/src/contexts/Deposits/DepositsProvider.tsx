import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { Deposit, DepositWithAvailableLiquidity, Intent, DepositIntent } from './types'
import { esl } from '@helpers/constants'
import { unpackPackedVenmoId } from '@helpers/poseidonHash'
import useAccount from '@hooks/useAccount'
import useSmartContracts from '@hooks/useSmartContracts';

import DepositsContext from './DepositsContext'


interface ProvidersProps {
  children: ReactNode;
}

const DepositsProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { isLoggedIn, loggedInEthereumAddress } = useAccount()
  const { rampAddress, rampAbi } = useSmartContracts()

  /*
   * State
   */

  const [deposits, setDeposits] = useState<DepositWithAvailableLiquidity[] | null>(null);
  const [depositIntents, setDepositIntents] = useState<DepositIntent[] | null>(null);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);
  const [uniqueIntentHashes, setUniqueIntentHashes] = useState<string[]>([]);
  const [shouldFetchDepositIntents, setShouldFetchDepositIntents] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // function getAccountDeposits(address _account)
  const {
    data: depositsRaw,
    // isLoading: isFetchDepositsLoading,
    // isError: isFetchDepositsError,
    refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getAccountDeposits',
    args: [
      loggedInEthereumAddress
    ],
    enabled: shouldFetchDeposits,
  })
      
  // getIntentsWithOnRamperId(bytes32[] calldata _intentHashes)
  const {
    data: depositIntentsRaw,
    // isLoading: isFetchDepositIntentsLoading,
    // isError: isFetchDepositIntentsError,
    refetch: refetchDepositIntents,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
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
    esl && console.log('checking rampAddress: ', rampAddress);

    if (isLoggedIn && loggedInEthereumAddress && rampAddress) {
      esl && console.log('shouldFetchDeposits_2');

      setShouldFetchDeposits(true);
    } else {
      esl && console.log('shouldFetchDeposits_3');

      setShouldFetchDeposits(false);

      setDeposits(null);
      setDepositIntents(null);
    }
  }, [isLoggedIn, loggedInEthereumAddress, rampAddress]);

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

    if (depositsRaw && depositsRaw.length > 0) {
      esl && console.log('depositsRaw_2');

      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: DepositWithAvailableLiquidity[] = [];
      const depositIntentHashes: string[][] = [];
      for (let i = depositsArrayRaw.length - 1; i >= 0; i--) {
        const depositWithAvailableLiquidityData = depositsArrayRaw[i];

        const depositData = depositWithAvailableLiquidityData.deposit;
        const deposit: Deposit = {
          depositor: depositData.depositor.toString(),
          venmoId: unpackPackedVenmoId(depositData.packedVenmoId),
          depositAmount: depositData.depositAmount,
          remainingDepositAmount: depositData.remainingDeposits,
          outstandingIntentAmount: depositData.outstandingIntentAmount,
          conversionRate: depositData.conversionRate,
          convenienceFee: depositData.convenienceFee,
          intentHashes: depositData.intentHashes,
        };

        const depositWithLiquidity: DepositWithAvailableLiquidity = {
          deposit,
          availableLiquidity: depositWithAvailableLiquidityData.availableLiquidity,
        }

        sanitizedDeposits.push(depositWithLiquidity);
        depositIntentHashes.push(depositData.intentHashes);
      }
          
      setDeposits(sanitizedDeposits);
      setUniqueIntentHashes(depositIntentHashes.flat());
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

        const onRamperVenmoHash = intentWithOnRamperId.onRamperIdHash;
        const depositIntent: DepositIntent = {
          intent,
          onRamperVenmoHash
        }

        sanitizedIntents.push(depositIntent);
      }

      setDepositIntents(sanitizedIntents);
    } else {
      esl && console.log('depositsIntentsRaw_3');
      
      setDepositIntents([]);
    }
  }, [depositIntentsRaw]);

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
