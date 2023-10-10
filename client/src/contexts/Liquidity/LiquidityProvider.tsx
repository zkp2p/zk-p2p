import React, {
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useMemo
} from 'react'
import { useContractRead } from 'wagmi'

import {
  Deposit,
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from '../Deposits/types'
import {
  calculateUsdFromRequestedUSDC,
  createDepositsStore,
  fetchBestDepositForAmount,
 } from './helper'
import { esl, CALLER_ACCOUNT } from '@helpers/constants'
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

  const [deposits, setDeposits] = useState<DepositWithAvailableLiquidity[] | null>(null);
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
    refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'getDepositFromIds',
    args: [
      depositIdsToFetch
    ],
    enabled: shouldFetchDeposits,
    account: CALLER_ACCOUNT
  })

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('shouldFetchDeposits_1');
    esl && console.log('checking rampAddress: ', rampAddress);
    esl && console.log('checking depositCounter: ', depositCounter);

    if (rampAddress && depositCounter) {
      esl && console.log('shouldFetchDeposits_2');

      setShouldFetchDeposits(true);
    } else {
      esl && console.log('shouldFetchDeposits_3');

      setShouldFetchDeposits(false);

      setDeposits(null);
      setDepositStore(null);
    }
  }, [rampAddress, depositCounter]);

  useEffect(() => {
    esl && console.log('liquidityDepositsRaw_1');
    esl && console.log('checking depositsRaw: ', depositsRaw);

    if (depositsRaw) {
      esl && console.log('liquidityDepositsRaw_2');

      const depositsArrayRaw = depositsRaw as any[];

      const sanitizedDeposits: DepositWithAvailableLiquidity[] = [];
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
      }

      setDeposits(sanitizedDeposits);
    } else {
      esl && console.log('liquidityDepositsRaw_3');
      
      setDeposits(null);
    }
  }, [depositsRaw]);

  useEffect(() => {
    esl && console.log('depositStore_1');
    esl && console.log('checking deposits: ', deposits);
    esl && console.log('checking depositIdsToFetch: ', depositIdsToFetch);

    if (deposits && deposits.length > 0 && depositIdsToFetch.length > 0) {
      esl && console.log('depositStore_2');

      const newStore = createDepositsStore(depositIdsToFetch, deposits); // This assumes depositIdsToFetch is correctly ordered

      setDepositStore(newStore);
    } else {
      esl && console.log('depositStore_3');

      setDepositStore(null);
    }
  }, [deposits, depositIdsToFetch]);

  const getBestDepositForAmount = useCallback((requestedOnRampInputAmount: string): IndicativeQuote => {
    if (depositStore) {
      return fetchBestDepositForAmount(requestedOnRampInputAmount, depositStore);
    } else {
      return {
        error: 'No deposits available'
      } as IndicativeQuote;
    }
  }, [depositStore]);

  return (
    <LiquidityContext.Provider
      value={{
        deposits,
        depositStore,
        getBestDepositForAmount,
        refetchDeposits,
        shouldFetchDeposits,
        calculateUsdFromRequestedUSDC,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider
