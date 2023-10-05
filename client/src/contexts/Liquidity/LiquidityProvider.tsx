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

  const [deposits, setDeposits] = useState<Deposit[] | null>(null);
  const [depositStore, setDepositStore] = useState<StoredDeposit[] | null>(null);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  const depositIdsToFetch = useMemo(() => {
    if (depositCounter) {
      const depositIds = [];
      for (let i = 0; i < depositCounter; i++) {
        depositIds.push(BigInt(i));
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

  // function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray)
  const {
    data: depositsRaw,
    // isLoading: isFetchDepositsLoading,
    // isError: isFetchDepositsError,
    // refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getDepositFromIds',
    args: [
      depositIdsToFetch
    ],
    enabled: shouldFetchDeposits
  })

  /*
   * Hooks
   */

  useEffect(() => {
    // console.log('shouldFetchDeposits_1');
    if (rampAddress && depositCounter) {
      // console.log('shouldFetchDeposits_2');
      setShouldFetchDeposits(true);
    } else {
      // console.log('shouldFetchDeposits_3');
      setShouldFetchDeposits(false);

      setDeposits(null);
      setDepositStore(null);
    }
  }, [rampAddress, depositCounter]);

  useEffect(() => {
    // console.log('liquidityDepositsRaw_1');
    if (depositsRaw) {
      // console.log('liquidityDepositsRaw_2');
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
      // console.log('liquidityDepositsRaw_3');
      setDeposits(null);
    }
  }, [depositsRaw]);

  useEffect(() => {
    if (deposits && depositIdsToFetch.length > 0) {
      // This assumes depositIdsToFetch is correctly ordered
      const newStore = createDepositsStore(depositIdsToFetch, deposits);
      setDepositStore(newStore);
    } else {
      setDepositStore(null);
    }
  }, [deposits, depositIdsToFetch]);

  // TODO: Check that depositor does not signal intent on own deposit
  const getBestDepositForAmount = useCallback((amount: bigint) => {
    if (depositStore) {
      return fetchBestDepositForAmount(amount, depositStore);
    } else {
      return null;
    }
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
