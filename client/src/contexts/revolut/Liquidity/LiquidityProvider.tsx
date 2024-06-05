import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { readContract } from '@wagmi/core';
import { ethers } from "ethers";

import {
  Abi,
  Deposit,
  DepositWithAvailableLiquidity,
  IndicativeQuote,
  PaymentPlatform,
  StoredDeposit,
  paymentPlatformInfo
} from '@helpers/types';
import {
  calculateUsdFromRequestedUSDC,
  createDepositsStore,
  fetchBestDepositForAmount,
  fetchDepositForMaxAvailableTransferSize
} from './helper';
import { esl, CALLER_ACCOUNT, ZERO } from '@helpers/constants';
import { keccak256 } from '@helpers/keccack';
import useSmartContracts from '@hooks/useSmartContracts';
import useRampState from '@hooks/revolut/useRampState';
import useDenyList from '@hooks/useDenyList';
import usePlatformSettings from '@hooks/usePlatformSettings';

import LiquidityContext from './LiquidityContext';


const BATCH_SIZE = 30;
const PRUNED_DEPOSITS_PREFIX = 'prunedRevolutDepositIds_';

const NOTARY_PUBKEY_HASH = process.env.NOTARY_PUBKEY_HASH;
if (!NOTARY_PUBKEY_HASH) {
    throw new Error("NOTARY_PUBKEY_HASH environment variable is not defined.");
};

interface ProvidersProps {
  children: ReactNode;
}

const LiquidityProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { currencyIndex } = usePlatformSettings();
  const { revolutRampAddress, revolutRampAbi } = useSmartContracts();
  const { depositCounter, maximumOnRampAmount } = useRampState();
  const { fetchVenmoDepositorDenyList } = useDenyList();

  /*
   * State
   */

  const currentRampAddressRef = useRef(revolutRampAddress);

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
    const venmoDenyList = await fetchVenmoDepositorDenyList();

    const batchedDeposits: DepositWithAvailableLiquidity[] = [];
    const depositIdsToPrune: bigint[] = [];
    
    for (let i = 0; i < depositIdsToFetch.length; i += BATCH_SIZE) {
      const depositIdBatch = depositIdsToFetch.slice(i, i + BATCH_SIZE);
      const rawDepositsData = await fetchDepositBatch(depositIdBatch);
      
      const deposits = sanitizeRawDeposits(rawDepositsData as any);
      for (let j = 0; j < deposits.length; j++) {
        const deposit = deposits[j];

        const pubkeyHashHex = ethers.utils.hexZeroPad(ethers.utils.hexlify(BigInt(NOTARY_PUBKEY_HASH)), 32);
        const isInvalidNotaryKeyHash = deposit.deposit.notaryKeyHash !== pubkeyHashHex;
        if (isInvalidNotaryKeyHash) {
          depositIdsToPrune.push(deposit.depositId);
        } else {
          const orderHasNoAvailableLiquidity = deposit.availableLiquidity < 1;
          if (orderHasNoAvailableLiquidity) {
            depositIdsToPrune.push(deposit.depositId);
          } else {
            batchedDeposits.push(deposit);
          }
        }
      }
    }

    if (currentRampAddressRef.current === rampAddress) {
      const newPrunedDepositIds = [...existingPrunedIds, ...depositIdsToPrune];
      updateStoredPrunedIds(rampAddress, newPrunedDepositIds);

      const venmoDenyListSet = new Set(venmoDenyList);
      const filteredDeposits = batchedDeposits.filter(deposit => !venmoDenyListSet.has(deposit.deposit.venmoId.replace(/\0+$/, '')));
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
        address: revolutRampAddress as `0x${string}`,
        abi: revolutRampAbi as Abi,
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
        platformType: PaymentPlatform.REVOLUT,
        depositor: depositData.depositor.toString(),
        venmoId: depositData.revolutTag,
        depositAmount: depositData.depositAmount,
        remainingDepositAmount: depositData.remainingDeposits,
        outstandingIntentAmount: depositData.outstandingIntentAmount,
        conversionRate: depositData.conversionRate,
        intentHashes: depositData.intentHashes,
        notaryKeyHash: depositData.notaryKeyHash,
        receiveCurrencyId: depositData.receiveCurrencyId,
      };

      const depositWithLiquidity: DepositWithAvailableLiquidity = {
        deposit,
        availableLiquidity: depositWithAvailableLiquidityData.availableLiquidity,
        depositId: depositWithAvailableLiquidityData.depositId,
        depositorIdHash: depositWithAvailableLiquidityData.depositorId,
      }

      sanitizedDeposits.push(depositWithLiquidity);
    }

    return sanitizedDeposits;
  };

  /*
   * Hooks
   */

  useEffect(() => {
    currentRampAddressRef.current = revolutRampAddress;
  }, [revolutRampAddress]);

  useEffect(() => {
    esl && console.log('revolut_shouldFetchDeposits_1');
    esl && console.log('checking depositCounter: ', depositCounter);
    esl && console.log('checking revolutRampAddress: ', revolutRampAddress);

    const fetchData = async () => {
      if (depositCounter && revolutRampAddress) {
        esl && console.log('revolut_shouldFetchDeposits_2');
  
        setShouldFetchDeposits(true);

        await fetchAndPruneDeposits(depositCounter, revolutRampAddress);
      } else {
        esl && console.log('revolut_shouldFetchDeposits_3');
  
        setShouldFetchDeposits(false);
  
        setDeposits(null);
        setDepositStore(null);

      }
    };
  
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositCounter, revolutRampAddress, fetchDepositsTrigger]);

  useEffect(() => {
    esl && console.log('revolut_depositStore_1');
    esl && console.log('checking deposits: ', deposits);

    if (deposits && deposits.length > 0) {
      esl && console.log('revolut_depositStore_2');

      const newStore = createDepositsStore(deposits);

      setDepositStore(newStore);
    } else {
      esl && console.log('revolut_depositStore_3');

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
        onRamperRegistrationHash,
        keccak256(paymentPlatformInfo[PaymentPlatform.REVOLUT].platformCurrencies[currencyIndex])
      );
    } else {
      return {
        error: 'No deposits available'
      } as IndicativeQuote;
    }
  }, [depositStore, currencyIndex]);

  const getDepositForMaxAvailableTransferSize = useCallback((onRamperRegistrationHash: string): IndicativeQuote => {
    if (depositStore && maximumOnRampAmount) {
      return fetchDepositForMaxAvailableTransferSize(
        maximumOnRampAmount,
        depositStore,
        onRamperRegistrationHash
      );
    } else {
      return {
        error: 'No deposits available'
      } as IndicativeQuote;
    }
  }, [depositStore, maximumOnRampAmount]);

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
        calculateUsdFromRequestedUSDC,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider;
