import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { readContract } from '@wagmi/core';

import {
  Deposit,
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from '../Deposits/types';
import {
  calculateUsdFromRequestedUSDC,
  createDepositsStore,
  fetchBestDepositForAmount,
 } from './helper';
 import { PaymentPlatform } from '../../common/PlatformSettings/types';
 import { Abi } from '../../common/SmartContracts/types';
import { esl, CALLER_ACCOUNT, ZERO } from '@helpers/constants';
import { unpackPackedVenmoId } from '@helpers/poseidonHash';

import useSmartContracts from '@hooks/useSmartContracts';
import useRampState from '@hooks/useRampState';

import LiquidityContext from './LiquidityContext';


const BATCH_SIZE = 30;
const PRUNED_DEPOSITS_PREFIX = 'prunedDepositIds_';
const TARGETED_DEPOSITS_PREFIX = 'targetedDepositIds_';

interface ProvidersProps {
  children: ReactNode;
}

const LiquidityProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { venmoRampAddress, venmoRampAbi } = useSmartContracts();
  const { depositCounter } = useRampState();

  /*
   * State
   */

  const currentRampAddressRef = useRef(venmoRampAddress);

  const [fetchDepositsTrigger, setFetchDepositsTrigger] = useState(0);

  const [deposits, setDeposits] = useState<DepositWithAvailableLiquidity[] | null>(null);
  const [depositStore, setDepositStore] = useState<StoredDeposit[] | null>(null);

  const [prunedDepositIds, setPrunedDepositIds] = useState<bigint[]>([]);
  const [targetedDepositIds, setTargetedDepositIds] = useState<bigint[]>([]);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  const fetchAndPruneDeposits = async (depositCounter: bigint, rampAddress: string) => {
    const existingPrunedIds = fetchStoredPrunedDepositIds(rampAddress);
    const existingTargetedIds = fetchStoredTargetedDepositIds(rampAddress);
    const depositIdsToFetch = initializeDepositIdsToFetch(depositCounter, existingPrunedIds);

    const batchedDeposits: DepositWithAvailableLiquidity[] = [];
    const depositIdsToPrune: bigint[] = [];
    
    for (let i = 0; i < depositIdsToFetch.length; i += BATCH_SIZE) {
      const depositIdBatch = depositIdsToFetch.slice(i, i + BATCH_SIZE);
      const rawDepositsData = await fetchDepositBatch(depositIdBatch);
      
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

    if (currentRampAddressRef.current === rampAddress) {
      const newPrunedDepositIds = [...existingPrunedIds, ...depositIdsToPrune];
      updateStoredPrunedIds(rampAddress, newPrunedDepositIds, existingTargetedIds);
  
      setTargetedDepositIds(existingTargetedIds);
  
      setDeposits(batchedDeposits);
    }
  };

  const initializeDepositIdsToFetch = (currentDepositCounter: bigint, storedDepositIdsToPrune: bigint[]): bigint[] => {
    if (currentDepositCounter) {
      const prunedIdsSet = new Set(storedDepositIdsToPrune.map(id => id.toString()));
      const depositIds = [];

      for (let i = 0; i < currentDepositCounter; i++) {
        const depositId = BigInt(i).toString();
        if (!prunedIdsSet.has(depositId)) {
          depositIds.push(BigInt(depositId));
        }
      }
  
      return depositIds;
    } else {
      return [];
    }
  };

  const fetchDepositBatch = async (depositIdBatch: bigint[]) => {
    try {
      // function getDepositFromIds(uint256[] memory _depositIds) external view returns (Deposit[] memory depositArray)
      const data = await readContract({
        address: venmoRampAddress as `0x${string}`,
        abi: venmoRampAbi as Abi,
        functionName: 'getDepositFromIds',
        args: [depositIdBatch],
        account: CALLER_ACCOUNT,
      });

      return data;
    } catch (error) {
      console.error('Error fetching deposits batch:', error);
      
      return [];
    }
  };

  const sanitizeRawDeposits = (rawDepositsData: any[]) => {
    const sanitizedDeposits: DepositWithAvailableLiquidity[] = [];

    for (let i = rawDepositsData.length - 1; i >= 0; i--) {
      const depositWithAvailableLiquidityData = rawDepositsData[i];
      
      const depositData = depositWithAvailableLiquidityData.deposit;
      const deposit: Deposit = {
        platformType: PaymentPlatform.VENMO,
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
    currentRampAddressRef.current = venmoRampAddress;
  }, [venmoRampAddress]);

  useEffect(() => {
    esl && console.log('venmo_shouldFetchDeposits_1');
    esl && console.log('checking depositCounter: ', depositCounter);
    esl && console.log('checking venmoRampAddress: ', venmoRampAddress);

    const fetchData = async () => {
      if (depositCounter && venmoRampAddress) {
        esl && console.log('venmo_shouldFetchDeposits_2');
  
        setShouldFetchDeposits(true);

        await fetchAndPruneDeposits(depositCounter, venmoRampAddress);
      } else {
        esl && console.log('venmo_shouldFetchDeposits_3');
  
        setShouldFetchDeposits(false);
  
        setDeposits(null);
        setDepositStore(null);
  
        setPrunedDepositIds([]);
        setTargetedDepositIds([]);
      }
    };
  
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositCounter, venmoRampAddress, fetchDepositsTrigger]);

  useEffect(() => {
    esl && console.log('venmo_depositStore_1');
    esl && console.log('checking deposits: ', deposits);

    if (deposits && deposits.length > 0) {
      esl && console.log('venmo_depositStore_2');

      const newStore = createDepositsStore(deposits);

      setDepositStore(newStore);
    } else {
      esl && console.log('venmo_depositStore_3');

      setDepositStore(null);
    }
  }, [deposits]);

  /*
   * Public
   */

  const refetchDeposits = () => {
    setFetchDepositsTrigger(prev => prev + 1);
  };

  const getBestDepositForAmount = useCallback((requestedOnRampInputAmount: string, onRamperAddress: string): IndicativeQuote => {
    if (depositStore) {
      return fetchBestDepositForAmount(
          requestedOnRampInputAmount,
          depositStore,
          targetedDepositIds,
          onRamperAddress
      );
    } else {
      return {
          error: 'No deposits available'
      } as IndicativeQuote;
    }
  }, [depositStore, targetedDepositIds]);

  const updateTargetedDepositIds = useCallback((targetedDepositIdsToStore: bigint[]) => {
    if (venmoRampAddress) {
      updateStoredTargetedIds(venmoRampAddress, targetedDepositIdsToStore);
    }
  }, [venmoRampAddress]);

  /*
   * Helpers
   */

  const filterPrunedDepositIdsFromTargetedDepositIds = (depositIdsToPrune: bigint[], existingTargetedIds: bigint[]) => {
    const prunedIdsSet = new Set(depositIdsToPrune.map(id => id.toString()));

    const targetedDepositIdsToKeep = existingTargetedIds.filter(id => !prunedIdsSet.has(id.toString()));

    setTargetedDepositIds(targetedDepositIdsToKeep);
  };

  const fetchStoredPrunedDepositIds = (contractAddress: string) => {
    const prunedIdsStorageKey = `${PRUNED_DEPOSITS_PREFIX}${contractAddress}`;
    const prunedIdsFromStorage = localStorage.getItem(prunedIdsStorageKey);
    const prunedIdsFromStorageParsed = prunedIdsFromStorage ? JSON.parse(prunedIdsFromStorage).map(BigInt) : [];

    return prunedIdsFromStorageParsed;
  };

  const fetchStoredTargetedDepositIds = (contractAddress: string) => {
    const targetedIdsStorageKey = `${TARGETED_DEPOSITS_PREFIX}${contractAddress}`;
    const targetedIdsFromStorage = localStorage.getItem(targetedIdsStorageKey);
    const targetedIdsFromStorageParsed = targetedIdsFromStorage ? JSON.parse(targetedIdsFromStorage).map(BigInt) : [];

    return targetedIdsFromStorageParsed;
  };

  const updateStoredTargetedIds = (rampAddress: string, targetedDepositIdsToStore: bigint[]) => {
    const storageKey = `${TARGETED_DEPOSITS_PREFIX}${rampAddress}`;
    const targetedDepositIdsForStorage = targetedDepositIdsToStore.map(id => id.toString());
    localStorage.setItem(storageKey, JSON.stringify(targetedDepositIdsForStorage));

    setTargetedDepositIds(targetedDepositIdsToStore);
  };

  const updateStoredPrunedIds = (rampAddress: string, prunedDepositIdsToStore: bigint[], existingTargetedIds: bigint[]) => {
    esl && console.log('updateStoredPrunedIds_1: ', rampAddress);

    const storageKey = `${PRUNED_DEPOSITS_PREFIX}${rampAddress}`;
    const prunedDepositIdsForStorage = prunedDepositIdsToStore.map(id => id.toString());
    localStorage.setItem(storageKey, JSON.stringify(prunedDepositIdsForStorage));

    setPrunedDepositIds(prunedDepositIdsToStore);

    filterPrunedDepositIdsFromTargetedDepositIds(prunedDepositIds, existingTargetedIds);
  };

  return (
    <LiquidityContext.Provider
      value={{
        deposits,
        depositStore,
        getBestDepositForAmount,
        refetchDeposits,
        shouldFetchDeposits,
        calculateUsdFromRequestedUSDC,
        targetedDepositIds,
        updateTargetedDepositIds,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider;
