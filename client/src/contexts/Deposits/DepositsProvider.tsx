import React, { useEffect, useState, ReactNode, useMemo } from 'react'
import { useContractRead } from 'wagmi'

import { Deposit, Intent } from './types'
import { fromUsdc, fromEther } from '../../helpers/units'
import { unpackPackedVenmoId } from '../../helpers/poseidonHash'
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

  // getIntentFromIds(bytes32[] memory _intentIds) external view returns (Intent[] memory intentArray)
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
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getIntentFromIds',
    args: [uniqueIntentHashes],
  });

  /*
   * Hooks
   */
  useEffect(() => {
    if (!isFetchDepositsLoading && !isFetchDepositsError && depositsRaw) {
      console.log('depositsRaw');
      console.log(depositsRaw);

      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: Deposit[] = [];
      for (let i = depositsArrayRaw.length - 1; i >= 0; i--) {
        const depositData = depositsArrayRaw[i];
        
        const deposit: Deposit = {
          depositor: depositData.depositor.toString(),
          venmoId: unpackPackedVenmoId(depositData.packedVenmoId),
          depositAmount: fromUsdc(depositData.depositAmount).toNumber(),
          remainingDepositAmount: fromUsdc(depositData.remainingDeposits).toNumber(),
          outstandingIntentAmount: fromUsdc(depositData.outstandingIntentAmount).toNumber(),
          conversionRate: fromEther(depositData.conversionRate).toNumber(),
          convenienceFee: fromEther(depositData.convenienceFee).toNumber(),
          intentHashes: depositData.intentHashes,
        };

        sanitizedDeposits.push(deposit);
      }

      if (isLoggedIn) {
        console.log('depositsProcessed');
        console.log(sanitizedDeposits);

        setDeposits(sanitizedDeposits);
      } else {
        setDeposits([]);
      }
    }
  }, [isLoggedIn, depositsRaw, isFetchDepositsLoading, isFetchDepositsError]);

  useEffect(() => {
    if (!isFetchDepositIntentsLoading && !isFetchDepositIntentsError && depositIntentsRaw) {
      console.log('depositIntentsRaw');
      console.log(depositIntentsRaw);

      const depositIntentsArray = depositIntentsRaw as any[];

      const sanitizedIntents: Intent[] = [];
      for (let i = depositIntentsArray.length - 1; i >= 0; i--) {
        const intentData = depositIntentsArray[i];
        
        const intent: Intent = {
          onRamper: intentData[0],
          deposit: intentData[1],
          amount: intentData[2],
          timestamp: intentData[3],
        };

        sanitizedIntents.push(intent);
      }

      if (isLoggedIn) {
        console.log('depositIntentsProcessed');
        console.log(sanitizedIntents);
        
        setDepositIntents(sanitizedIntents);
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
