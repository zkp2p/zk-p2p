import React, {
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useMemo
} from 'react'
import { useContractRead } from 'wagmi'

import { Deposit, StoredDeposit } from '../Deposits/types'
import { fetchBestDepositForAmount, createDepositsStore } from './helper'
import { unpackPackedVenmoId } from '@helpers/poseidonHash'
import useSmartContracts from '@hooks/useSmartContracts';
import useRampState from '@hooks/useRampState';

import LiquidityContext from './LiquidityContext'


interface ProvidersProps {
  children: ReactNode;
}

const LiquidityProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */
  const { rampAddress, rampAbi } = useSmartContracts()
  const { depositCounter } = useRampState();

  /*
   * State
   */
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [depositStore, setDepositStore] = useState<StoredDeposit[]>([]);

  /*
   * Contract Reads
   */

  // function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray)
  const depositIdsToFetch = useMemo(() => {
    if (depositCounter) {
      const depositIds = [];
      for (let i = 0; i < depositCounter; i++) {
        depositIds.push(i);
      }

      /*
      * TODO:
      * Compare the depositCounter against list of ids stored in local storage to ignore
      * that list should only contain Deposits that have no remaining liquidity
      */

      return depositIds;
    } else {
      return [];
    }
  }, [depositCounter]);

  const {
    data: depositsRaw,
    isLoading: isFetchDepositsLoading,
    isError: isFetchDepositsError,
    // refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getDepositFromIds',
    args: [depositIdsToFetch],
  })

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
          venmoId: unpackPackedVenmoId(depositData.packedVenmoId),
          depositAmount: depositData.depositAmount,
          remainingDepositAmount: depositData.remainingDeposits,
          outstandingIntentAmount: depositData.outstandingIntentAmount,
          conversionRate: depositData.conversionRate,
          convenienceFee: depositData.convenienceFee,
          intentHashes: depositData.intentHashes,
        };

        sanitizedDeposits.push(deposit);
      }

      setDeposits(sanitizedDeposits);
    } else {
      setDeposits([]);
    }
  }, [depositsRaw, isFetchDepositsLoading, isFetchDepositsError]);

  useEffect(() => {
    const newStore = createDepositsStore(depositIdsToFetch, deposits); // Assume depositIdsToFetch is correct
    setDepositStore(newStore);
  }, [deposits, depositIdsToFetch]);

  const getBestDepositForAmount = useCallback((amount: number) => {
    return fetchBestDepositForAmount(amount, depositStore);
  }, [depositStore]);

  return (
    <LiquidityContext.Provider
      value={{
        deposits,
        depositStore,
        getBestDepositForAmount,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider
