import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { readContract } from '@wagmi/core';

import {
  Abi,
} from '@helpers/types';
import {
  Deposit,
  DepositView,
  StoredDeposit
} from '@helpers/types/escrow';
import {
  createDepositsStore
 } from './helper';
import { esl, CALLER_ACCOUNT, ZERO } from '@helpers/constants';
import useSmartContracts from '@hooks/useSmartContracts';
import useEscrowState from '@hooks/escrow/useEscrowState';

import LiquidityContext from './LiquidityContext';


const BATCH_SIZE = 30;
const PRUNED_DEPOSITS_PREFIX = 'prunedEscrowDepositIds_';

interface ProvidersProps {
  children: ReactNode;
}

const LiquidityProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { escrowAddress, escrowAbi } = useSmartContracts();
  const { depositCounter } = useEscrowState();

  /*
   * State
   */

  const currentRampAddressRef = useRef(escrowAddress);

  const [fetchDepositsTrigger, setFetchDepositsTrigger] = useState(0);

  const [deposits, setDeposits] = useState<DepositView[] | null>(null);
  const [depositStore, setDepositStore] = useState<StoredDeposit[] | null>(null);

  const [shouldFetchDeposits, setShouldFetchDeposits] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  const fetchAndPruneDeposits = async (depositCounter: bigint, rampAddress: string) => {
    const existingPrunedIds = fetchStoredPrunedDepositIds(rampAddress);
    const depositIdsToFetch = initializeDepositIdsToFetch(depositCounter, existingPrunedIds);
  
    const batchedDeposits: DepositView[] = [];
    const depositIdsToPrune: bigint[] = [];
    
    for (let i = 0; i < depositIdsToFetch.length; i += BATCH_SIZE) {
      const depositIdBatch = depositIdsToFetch.slice(i, i + BATCH_SIZE);
      const rawDepositsData = await fetchDepositBatch(depositIdBatch);
      
      const deposits = sanitizeRawDeposits(rawDepositsData as any);
      for (let j = 0; j < deposits.length; j++) {
        const deposit = deposits[j];

        const orderHasNoAvailableLiquidity = deposit.availableLiquidity < deposit.deposit.minIntentAmount;
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
      // function getDepositFromIds(uint256[] memory _depositIds) external view returns (DepositView[] memory depositArray)
      const data = await readContract({
        address: escrowAddress as `0x${string}`,
        abi: escrowAbi as Abi,
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
    const sanitizedDeposits: DepositView[] = [];

    for (let i = rawDepositsData.length - 1; i >= 0; i--) {
      const depositView = rawDepositsData[i];
      
      const depositData = depositView.deposit;
      const deposit: Deposit = {
        depositor: depositData.depositor.toString(),
        token: depositData.token,
        depositAmount: depositData.amount,
        minIntentAmount: depositData.intentAmountRange.min,
        maxIntentAmount: depositData.intentAmountRange.max,
        verifiers: depositData.verifiers,
        acceptingIntents: depositData.acceptingIntents,
        remainingDepositAmount: depositData.remainingDepositAmount,
        outstandingIntentAmount: depositData.outstandingIntentAmount,
        intentHashes: depositData.intentHashes,
      };

      const depositWithLiquidity: DepositView = {
        deposit,
        availableLiquidity: depositView.availableLiquidity,
        depositId: depositView.depositId,
        verifiers: depositView.verifiers
      }

      sanitizedDeposits.push(depositWithLiquidity);
    }

    return sanitizedDeposits;
  };

  /*
   * Hooks
   */

  useEffect(() => {
    currentRampAddressRef.current = escrowAddress;
  }, [escrowAddress]);

  useEffect(() => {
    esl && console.log('escrow_shouldFetchDeposits_1');
    esl && console.log('checking depositCounter: ', depositCounter);
    esl && console.log('checking escrowAddress: ', escrowAddress);

    const fetchData = async () => {
      if (depositCounter && escrowAddress) {
        esl && console.log('escrow_shouldFetchDeposits_2');
  
        setShouldFetchDeposits(true);

        await fetchAndPruneDeposits(depositCounter, escrowAddress);
      } else {
        esl && console.log('escrow_shouldFetchDeposits_3');
  
        setShouldFetchDeposits(false);
  
        setDeposits(null);
        setDepositStore(null);
      }
    };
  
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositCounter, escrowAddress, fetchDepositsTrigger]);

  useEffect(() => {
    esl && console.log('escrow_depositStore_1');
    esl && console.log('checking deposits: ', deposits);

    if (deposits && deposits.length > 0) {
      esl && console.log('escrow_depositStore_2');

      const newStore = createDepositsStore(deposits);

      setDepositStore(newStore);
    } else {
      esl && console.log('escrow_depositStore_3');

      setDepositStore(null);
    }
  }, [deposits]);

  /*
   * Public
   */

  const refetchDeposits = () => {
    setFetchDepositsTrigger(prev => prev + 1);
  };

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
        refetchDeposits,
        shouldFetchDeposits,
      }}
    >
      {children}
    </LiquidityContext.Provider>
  );
};

export default LiquidityProvider;
