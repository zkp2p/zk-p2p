import React, { useEffect, useState, ReactNode, useMemo } from 'react'
import { useContractRead, useContractReads } from 'wagmi'

import { Deposit, Intent } from './types'
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
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [depositIntents, setDepositIntents] = useState<Intent[]>([]);

  /*
   * Contract Reads
   */

  // function getAccountDeposits(address _account) external view returns (Deposit[] memory accountDeposits) {
  const {
    data: depositsRaw,
    isLoading: isFetchDepositsLoading,
    isError: isFetchDepositsError,
    // refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getAccountDeposits',
    args: [loggedInEthereumAddress],
  })

  // mapping(bytes32 => Intent) public intents;
  const rampContract = {
    address: rampAddress,
    abi: rampAbi as any,
  }

  const uniqueIntentHashes = useMemo(() => {
    if (depositsRaw) {
      return [...new Set((depositsRaw as Deposit[]).flatMap((deposit: any) => deposit.intentHashes))];
    }
    return [];
  }, [depositsRaw]);

  const {
    data: depositIntentsRaw,
    isLoading: isFetchDepositIntentsLoading,
    isError: isFetchDepositIntentsError,
    // refetch: refetchDepositIntents,
  } = useContractReads({
    contracts: uniqueIntentHashes.map((hash) => ({
      ...rampContract,
      functionName: 'intents',
      args: [hash],
    })),
  });

  /*
   * Hooks
   */
  useEffect(() => {
    if (!isFetchDepositsLoading && !isFetchDepositsError && depositsRaw) {
      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: Deposit[] = [];
      for (let i = depositsArrayRaw.length - 1; i >= 0; i--) {
        const depositData = depositsArrayRaw[i];
        
        const deposit: Deposit = {
          depositor: depositData.depositor.toString(),
          remainingDepositAmount: depositData.remainingDeposits.toString(),
          outstandingIntentAmount: depositData.outstandingIntentAmount.toString(),
          conversionRate: depositData.conversionRate.toString(),
          convenienceFee: depositData.convenienceFee.toString(),
          intentHashes: depositData.intentHashes,
        };

        sanitizedDeposits.push(deposit);
      }

      if (isLoggedIn) {
        setDeposits(sanitizedDeposits);
        console.log(sanitizedDeposits);
      } else {
        setDeposits([]);
      }
    }
  }, [isLoggedIn, depositsRaw, isFetchDepositsLoading, isFetchDepositsError]);

  useEffect(() => {
    if (!isFetchDepositIntentsLoading && !isFetchDepositIntentsError && depositIntentsRaw) {
      const depositIntentsArray = depositIntentsRaw as any[];

      const sanitizedIntents: Intent[] = [];
      for (let i = depositIntentsArray.length - 1; i >= 0; i--) {
        const intentData = depositIntentsArray[i];
        
        const intent: Intent = {
          onRamper: intentData.onramper,
          deposit: intentData.deposit,
          amount: intentData.amount,
          timestamp: intentData.intentTimestamp,
        };

        sanitizedIntents.push(intent);
      }

      if (isLoggedIn) {
        setDepositIntents(sanitizedIntents);
        console.log(sanitizedIntents);
      } else {
        setDepositIntents([]);
      }
    }
  }, [isLoggedIn, deposits, depositIntentsRaw, isFetchDepositIntentsLoading, isFetchDepositIntentsError]);

  return (
    <DepositsContext.Provider
      value={{
        deposits,
        depositIntents,
      }}
    >
      {children}
    </DepositsContext.Provider>
  );
};

export default DepositsProvider
