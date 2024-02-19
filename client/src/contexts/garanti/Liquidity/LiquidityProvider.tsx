import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { readContract } from '@wagmi/core';

import {
  Abi,
  Deposit,
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  PaymentPlatform,
  StoredDeposit
} from '@helpers/types';
import {
  calculateUsdFromRequestedUSDC,
  createDepositsStore,
  fetchBestDepositForAmount,
  fetchDepositForMaxAvailableTransferSize
 } from '../../venmo/Liquidity/helper';
import { esl, CALLER_ACCOUNT, ZERO, MAX_USDC_TRANSFER_SIZE_HDFC } from '@helpers/constants';
import useSmartContracts from '@hooks/useSmartContracts';
import useGarantiRampState from '@hooks/garanti/useRampState';
import useDenyList from '@hooks/useDenyList';

import LiquidityContext from './LiquidityContext';


const BATCH_SIZE = 30;
const PRUNED_DEPOSITS_PREFIX = 'prunedGarantiDepositIds_';

interface ProvidersProps {
  children: ReactNode;
}

const LiquidityProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { garantiRampAddress, garantiRampAbi } = useSmartContracts();
  const { depositCounter } = useGarantiRampState();
  const { fetchGarantiDepositoryDenyList } = useDenyList();

  /*
   * State
   */

  const currentRampAddressRef = useRef(garantiRampAddress);

  const [fetchDepositsTrigger, setFetchDepositsTrigger] = useState(0);

  const [deposits, setDeposits] = useState<DepositWithAvailableLiquidity[] | null>(null);
  const [depositStore, setDepositStore] = useState<StoredDeposit[] | null>(null);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  const fetchAndPruneDeposits = async (depositCounter: bigint, rampAddress: string) => {
    const existingPrunedIds = fetchStoredPrunedDepositIds(rampAddress);
    const depositIdsToFetch = initializeDepositIdsToFetch(depositCounter, existingPrunedIds);
    const garantiDenyList = await fetchGarantiDepositoryDenyList();

    const batchedDeposits: DepositWithAvailableLiquidity[] = [];
    const depositIdsToPrune: bigint[] = [];
    
    for (let i = 0; i < depositIdsToFetch.length; i += BATCH_SIZE) {
      const depositIdBatch = depositIdsToFetch.slice(i, i + BATCH_SIZE);
      const rawDepositsData = await fetchDepositBatch(depositIdBatch);
      
      const deposits = sanitizeRawDeposits(rawDepositsData as any);
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
      updateStoredPrunedIds(rampAddress, newPrunedDepositIds);
  
      const garantiDenyListSet = new Set(garantiDenyList);
      const filteredDeposits = batchedDeposits.filter(deposit => !garantiDenyListSet.has(deposit.deposit.venmoId));
      setDeposits(filteredDeposits);
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
        address: garantiRampAddress as `0x${string}`,
        abi: garantiRampAbi as Abi,
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
        platformType: PaymentPlatform.HDFC, // Change to GARANTI
        depositor: depositData.depositor.toString(),
        venmoId: depositData.garantiIban,
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
        depositorIdHash: depositWithAvailableLiquidityData.depositorIdHash,
      }

      sanitizedDeposits.push(depositWithLiquidity);
    }

    return sanitizedDeposits;
  };

  /*
   * Hooks
   */

  useEffect(() => {
    currentRampAddressRef.current = garantiRampAddress;
  }, [garantiRampAddress]);

  useEffect(() => {
    esl && console.log('venmo_shouldFetchDeposits_1');
    esl && console.log('checking depositCounter: ', depositCounter);
    esl && console.log('checking garantiRampAddress: ', garantiRampAddress);

    const fetchData = async () => {
      if (depositCounter && garantiRampAddress) {
        esl && console.log('venmo_shouldFetchDeposits_2');
  
        setShouldFetchDeposits(true);

        await fetchAndPruneDeposits(depositCounter, garantiRampAddress);
      } else {
        esl && console.log('venmo_shouldFetchDeposits_3');
  
        setShouldFetchDeposits(false);
  
        setDeposits(null);
        setDepositStore(null);
      }
    };
  
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositCounter, garantiRampAddress, fetchDepositsTrigger]);

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

  const getBestDepositForAmount = useCallback((requestedOnRampInputAmount: string, onRamperRegistrationHash: string): IndicativeQuote => {
    if (depositStore) {
      return fetchBestDepositForAmount(
        requestedOnRampInputAmount,
        depositStore,
        onRamperRegistrationHash
      );
    } else {
      return {
        error: 'No deposits available'
      } as IndicativeQuote;
    }
  }, [depositStore]);

  const getDepositForMaxAvailableTransferSize = useCallback((onRamperRegistrationHash: string): IndicativeQuote => {
    if (depositStore) {
      return fetchDepositForMaxAvailableTransferSize(
        MAX_USDC_TRANSFER_SIZE_HDFC,
        depositStore,
        onRamperRegistrationHash
      );
    } else {
      return {
        error: 'No deposits available'
      } as IndicativeQuote;
    }
  }, [depositStore]);

  /*
   * Helpers
   */

  const fetchStoredPrunedDepositIds = (contractAddress: string) => {
    const prunedIdsStorageKey = `${PRUNED_DEPOSITS_PREFIX}${contractAddress}`;
    const prunedIdsFromStorage = localStorage.getItem(prunedIdsStorageKey);
    const prunedIdsFromStorageParsed = prunedIdsFromStorage ? JSON.parse(prunedIdsFromStorage).map(BigInt) : [];

    return prunedIdsFromStorageParsed;
  };

  const updateStoredPrunedIds = (rampAddress: string, prunedDepositIdsToStore: bigint[]) => {
    esl && console.log('updateStoredPrunedIds_1: ', rampAddress);

    const storageKey = `${PRUNED_DEPOSITS_PREFIX}${rampAddress}`;
    const prunedDepositIdsForStorage = prunedDepositIdsToStore.map(id => id.toString());
    localStorage.setItem(storageKey, JSON.stringify(prunedDepositIdsForStorage));
  };

  return (
    <LiquidityContext.Provider
      value={{
        deposits,
        depositStore,
        getBestDepositForAmount,
        getDepositForMaxAvailableTransferSize,
        refetchDeposits,
        shouldFetchDeposits,
        calculateUsdFromRequestedUSDC
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider;
