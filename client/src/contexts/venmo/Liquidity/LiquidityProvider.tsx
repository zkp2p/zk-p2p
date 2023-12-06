import React, {
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useMemo
} from 'react';
import { readContract } from '@wagmi/core';

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
import { esl, CALLER_ACCOUNT, ZERO } from '@helpers/constants'
import { unpackPackedVenmoId } from '@helpers/poseidonHash'
import useSmartContracts from '@hooks/useSmartContracts';
import useRampState from '@hooks/useRampState';
import useAccount from '@hooks/useAccount'

import LiquidityContext from './LiquidityContext'


const BATCH_SIZE = 50;
const PRUNED_DEPOSITS_PREFIX = 'prunedDepositIds_';
const TARGETED_DEPOSITS_PREFIX = 'targetedDepositIds_';

interface ProvidersProps {
  children: ReactNode;
}

const LiquidityProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { rampAddress, rampAbi } = useSmartContracts()
  const { depositCounter } = useRampState();
  const { loggedInEthereumAddress } = useAccount();

  /*
   * State
   */

  const [deposits, setDeposits] = useState<DepositWithAvailableLiquidity[] | null>(null);
  const [depositStore, setDepositStore] = useState<StoredDeposit[] | null>(null);

  const [prunedDepositIds, setPrunedDepositIds] = useState<bigint[]>([]);
  const [targetedDepositIds, setTargetedDepositIds] = useState<bigint[]>([]);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  const fetchDepositsBatched = useCallback(async (depositIdBatch: bigint[]) => {
    try {
      // function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray)
      const data = await readContract({
        address: rampAddress,
        abi: rampAbi,
        functionName: 'getDepositFromIds',
        args: [depositIdBatch],
        account: CALLER_ACCOUNT,
      });

      return data;
    } catch (error) {
      console.error('Error fetching deposits batch:', error);
      
      return [];
    }
  }, [rampAddress, rampAbi]);

  const depositIdsToFetch = useMemo(() => {
    if (depositCounter) {
      const prunedIdsSet = new Set(prunedDepositIds.map(id => id.toString()));
      const depositIds = [];

      for (let i = 0; i < depositCounter; i++) {
        const depositId = BigInt(i).toString();
        if (!prunedIdsSet.has(depositId)) {
          depositIds.push(BigInt(depositId));
        }
      }
  
      return depositIds;
    } else {
      return [];
    }
  }, [depositCounter, prunedDepositIds]);

  const refetchDepositsBatched = useCallback(async () => {
    const batchedDeposits: DepositWithAvailableLiquidity[] = [];
    const depositIdsToPrune: bigint[] = [];
    
    for (let i = 0; i < depositIdsToFetch.length; i += BATCH_SIZE) {
      const depositIdBatch = depositIdsToFetch.slice(i, i + BATCH_SIZE);
      const rawDepositsData: any[] = await fetchDepositsBatched(depositIdBatch);
      
      const deposits = sanitizeRawDeposits(rawDepositsData);
      for (let j = 0; j < deposits.length; j++) {
        const deposit = deposits[j];

        const orderHasNoAvailableLiquidity = deposit.availableLiquidity < 1;
        const orderHasNoOustandingIntent = deposit.deposit.outstandingIntentAmount === ZERO;
        const orderIsFilled = orderHasNoAvailableLiquidity && orderHasNoOustandingIntent;

        if (orderIsFilled) {
          depositIdsToPrune.push(deposit.depositId);
        } else {
          batchedDeposits.push(deposit);
        }
      }
    }

    // Persist pruned deposit ids
    const newPrunedDepositIds = [...prunedDepositIds, ...depositIdsToPrune];
    setPrunedDepositIds(newPrunedDepositIds);

    setDeposits(batchedDeposits);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositIdsToFetch, fetchDepositsBatched, prunedDepositIds]);

  const sanitizeRawDeposits = (rawDepositsData: any[]) => {
    const sanitizedDeposits: DepositWithAvailableLiquidity[] = [];

    for (let i = rawDepositsData.length - 1; i >= 0; i--) {
      const depositWithAvailableLiquidityData = rawDepositsData[i];
      
      const depositData = depositWithAvailableLiquidityData.deposit;
      const deposit: Deposit = {
        depositor: depositData.depositor.toString(),
        venmoId: unpackPackedVenmoId(depositData.packedVenmoId),
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
    }

    return sanitizedDeposits;
  };

  /*
   * Hooks
   */

  useEffect(() => {
    if (rampAddress) {
      const prunedIdsStorageKey = `${PRUNED_DEPOSITS_PREFIX}${rampAddress}`;
      const prunedIdsFromStorage = localStorage.getItem(prunedIdsStorageKey);
      setPrunedDepositIds(prunedIdsFromStorage ? JSON.parse(prunedIdsFromStorage).map(BigInt) : []);

      const targetedIdsStorageKey = `${TARGETED_DEPOSITS_PREFIX}${rampAddress}`;
      const targetedIdsFromStorage = localStorage.getItem(targetedIdsStorageKey);
      setTargetedDepositIds(targetedIdsFromStorage ? JSON.parse(targetedIdsFromStorage).map(BigInt) : []);
    } else {
      setPrunedDepositIds([]);
      setTargetedDepositIds([]);
    }
  }, [rampAddress]);

  useEffect(() => {
    if (rampAddress) {
      const storageKey = `${PRUNED_DEPOSITS_PREFIX}${rampAddress}`;
      const prunedDepositIdsForStorage = prunedDepositIds.map(id => id.toString());
      localStorage.setItem(storageKey, JSON.stringify(prunedDepositIdsForStorage));

      filterPrunedDepositIdsFromTargetedDepositIds(prunedDepositIds);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prunedDepositIds, rampAddress]);

  useEffect(() => {
    if (rampAddress) {
      const storageKey = `${TARGETED_DEPOSITS_PREFIX}${rampAddress}`;
      const targetedDepositIdsForStorage = targetedDepositIds.map(id => id.toString());
      localStorage.setItem(storageKey, JSON.stringify(targetedDepositIdsForStorage));
    }
  }, [targetedDepositIds, rampAddress]);

  useEffect(() => {
    const fetchDeposits = async () => {
      if (shouldFetchDeposits) {
        await refetchDepositsBatched();
      }
    };
  
    fetchDeposits();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchDeposits]);

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
    esl && console.log('depositStore_1');
    esl && console.log('checking deposits: ', deposits);
    esl && console.log('loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (deposits && deposits.length > 0) {
      esl && console.log('depositStore_2');

      if (loggedInEthereumAddress) {
        const newStore = createDepositsStore(deposits);
        
        setDepositStore(newStore);
      } else {
        const newStore = createDepositsStore(deposits);
        
        setDepositStore(newStore);
      }
    } else {
      esl && console.log('depositStore_3');

      setDepositStore(null);
    }
  }, [deposits, loggedInEthereumAddress]);

  const getBestDepositForAmount = useCallback((requestedOnRampInputAmount: string): IndicativeQuote => {
    if (depositStore) {
      return fetchBestDepositForAmount(
        requestedOnRampInputAmount,
        depositStore,
        targetedDepositIds,
        loggedInEthereumAddress
      );
    } else {
      return {
        error: 'No deposits available'
      } as IndicativeQuote;
    }
  }, [depositStore, targetedDepositIds, loggedInEthereumAddress]);

  /*
   * Helpers
   */

  const filterPrunedDepositIdsFromTargetedDepositIds = (depositIdsToPrune: bigint[]) => {
    const prunedIdsSet = new Set(depositIdsToPrune.map(id => id.toString()));

    const targetedDepositIdsToKeep = targetedDepositIds.filter(id => !prunedIdsSet.has(id.toString()));

    setTargetedDepositIds(targetedDepositIdsToKeep);
  };

  return (
    <LiquidityContext.Provider
      value={{
        deposits,
        depositStore,
        getBestDepositForAmount,
        refetchDeposits: refetchDepositsBatched,
        shouldFetchDeposits,
        calculateUsdFromRequestedUSDC,
        targetedDepositIds,
        setTargetedDepositIds,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider
