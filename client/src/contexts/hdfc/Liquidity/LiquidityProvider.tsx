import React, {
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useMemo
} from 'react';
import { Address } from 'wagmi';
import { readContract } from '@wagmi/core';

import {
  Deposit,
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  StoredDeposit
} from '../../venmo/Deposits/types';
import {
  calculateUsdFromRequestedUSDC,
  createDepositsStore,
  fetchBestDepositForAmount,
 } from '../../venmo/Liquidity/helper';
 import { PaymentPlatform } from '../../common/PlatformSettings/types';
import { esl, CALLER_ACCOUNT, ZERO } from '@helpers/constants';
import { unpackPackedVenmoId } from '@helpers/poseidonHash';
import useAccount from '@hooks/useAccount';
import useSmartContracts from '@hooks/useSmartContracts';
import useHdfcRampState from '@hooks/hdfc/useHdfcRampState';

import LiquidityContext from './LiquidityContext';


const BATCH_SIZE = 50;
const PRUNED_DEPOSITS_PREFIX = 'prunedHdfcDepositIds_';
const TARGETED_DEPOSITS_PREFIX = 'targetedHdfcDepositIds_';

interface ProvidersProps {
  children: ReactNode;
}

const LiquidityProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { hdfcRampAddress, hdfcRampAbi } = useSmartContracts();
  const { depositCounter } = useHdfcRampState();
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
        address: hdfcRampAddress,
        abi: hdfcRampAbi,
        functionName: 'getDepositFromIds',
        args: [depositIdBatch],
        account: CALLER_ACCOUNT,
      });

      return data;
    } catch (error) {
      console.error('Error fetching deposits batch:', error);
      
      return [];
    }
  }, [hdfcRampAddress, hdfcRampAbi]);

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

  const refetchDepositsBatched = useCallback(async (currentRampAddress: Address = hdfcRampAddress) => {
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
          esl && console.log('pruning deposit: ', deposit);
          depositIdsToPrune.push(deposit.depositId);
        } else {
          batchedDeposits.push(deposit);
        }
      }
    }

    // Persist pruned deposit ids and set deposits
    if (currentRampAddress === hdfcRampAddress) {
      const newPrunedDepositIds = [...prunedDepositIds, ...depositIdsToPrune];
      setPrunedDepositIds(newPrunedDepositIds);

      setDeposits(batchedDeposits);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositIdsToFetch, fetchDepositsBatched, prunedDepositIds]);

  const sanitizeRawDeposits = (rawDepositsData: any[]) => {
    const sanitizedDeposits: DepositWithAvailableLiquidity[] = [];

    for (let i = rawDepositsData.length - 1; i >= 0; i--) {
      const depositWithAvailableLiquidityData = rawDepositsData[i];
      
      const depositData = depositWithAvailableLiquidityData.deposit;
      const deposit: Deposit = {
        platformType: PaymentPlatform.HDFC,
        depositor: depositData.depositor.toString(),
        venmoId: unpackPackedVenmoId(depositData.upiId),
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
    esl && console.log('hdfc_storedPrunedIds_1');
    esl && console.log('checking rampAddress: ', hdfcRampAddress);

    if (hdfcRampAddress) {
      esl && console.log('hdfc_storedPrunedIds_2');

      const prunedIdsStorageKey = `${PRUNED_DEPOSITS_PREFIX}${hdfcRampAddress}`;
      const prunedIdsFromStorage = localStorage.getItem(prunedIdsStorageKey);
      setPrunedDepositIds(prunedIdsFromStorage ? JSON.parse(prunedIdsFromStorage).map(BigInt) : []);

      const targetedIdsStorageKey = `${TARGETED_DEPOSITS_PREFIX}${hdfcRampAddress}`;
      const targetedIdsFromStorage = localStorage.getItem(targetedIdsStorageKey);
      setTargetedDepositIds(targetedIdsFromStorage ? JSON.parse(targetedIdsFromStorage).map(BigInt) : []);
    } else {
      esl && console.log('hdfc_storedPrunedIds_3');

      setPrunedDepositIds([]);
      setTargetedDepositIds([]);
    }
  }, [hdfcRampAddress]);

  useEffect(() => {
    esl && console.log('hdfc_filterPrunedDepositIdsFromTargetedDepositIds_1');
    esl && console.log('checking rampAddress: ', hdfcRampAddress);

    if (hdfcRampAddress) {
      esl && console.log('hdfc_filterPrunedDepositIdsFromTargetedDepositIds_2');

      const storageKey = `${PRUNED_DEPOSITS_PREFIX}${hdfcRampAddress}`;
      const prunedDepositIdsForStorage = prunedDepositIds.map(id => id.toString());
      localStorage.setItem(storageKey, JSON.stringify(prunedDepositIdsForStorage));

      filterPrunedDepositIdsFromTargetedDepositIds(prunedDepositIds);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prunedDepositIds, hdfcRampAddress]);

  useEffect(() => {
    esl && console.log('hdfc_storeTargetedIds_1');
    esl && console.log('checking rampAddress: ', hdfcRampAddress);

    if (hdfcRampAddress) {
      esl && console.log('hdfc_storeTargetedIds_2');

      const storageKey = `${TARGETED_DEPOSITS_PREFIX}${hdfcRampAddress}`;
      const targetedDepositIdsForStorage = targetedDepositIds.map(id => id.toString());
      localStorage.setItem(storageKey, JSON.stringify(targetedDepositIdsForStorage));
    }
  }, [targetedDepositIds, hdfcRampAddress]);

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
    esl && console.log('hdfc_shouldFetchDeposits_1');
    esl && console.log('checking hdfcRampAddress: ', hdfcRampAddress);
    esl && console.log('checking depositCounter: ', depositCounter);

    if (hdfcRampAddress && depositCounter) {
      esl && console.log('hdfc_shouldFetchDeposits_2');

      setShouldFetchDeposits(true);
    } else {
      esl && console.log('hdfc_shouldFetchDeposits_3');

      setShouldFetchDeposits(false);

      setDeposits(null);
      setDepositStore(null);
    }
  }, [hdfcRampAddress, depositCounter]);

  useEffect(() => {
    esl && console.log('hdfc_depositStore_1');
    esl && console.log('checking deposits: ', deposits);
    esl && console.log('hdfc_loggedInEthereumAddress: ', loggedInEthereumAddress);

    if (deposits && deposits.length > 0) {
      esl && console.log('hdfc_depositStore_2');

      if (loggedInEthereumAddress) {
        const newStore = createDepositsStore(deposits);
        
        setDepositStore(newStore);
      } else {
        const newStore = createDepositsStore(deposits);
        
        setDepositStore(newStore);
      }
    } else {
      esl && console.log('hdfc_depositStore_3');

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

export default LiquidityProvider;
