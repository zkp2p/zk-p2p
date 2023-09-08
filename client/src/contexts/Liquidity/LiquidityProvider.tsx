import React, { useEffect, useState, ReactNode, useMemo } from 'react'
import { useContractRead } from 'wagmi'

import { Deposit } from '../Deposits/types'
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

  /*
   * Contract Reads
   */

  // function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray)
  const depositIdsToFetch = useMemo(() => {
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
          remainingDepositAmount: depositData.remainingDeposits.toString(),
          outstandingIntentAmount: depositData.outstandingIntentAmount.toString(),
          conversionRate: depositData.conversionRate.toString(),
          convenienceFee: depositData.convenienceFee.toString(),
          intentHashes: depositData.intentHashes,
        };

        sanitizedDeposits.push(deposit);
      }

      setDeposits(sanitizedDeposits);
    } else {
      setDeposits([]);
    }
  }, [depositsRaw, isFetchDepositsLoading, isFetchDepositsError]);

  return (
    <LiquidityContext.Provider
      value={{
        deposits,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider
