import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { esl, ZERO } from '@helpers/constants'
import useSmartContracts from '@hooks/useSmartContracts';

import RampContext from './RampContext'


interface ProvidersProps {
  children: ReactNode;
}

const RampProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { rampAddress, rampAbi } = useSmartContracts()

  /*
   * State
   */

  const [minimumDepositAmount, setMinimumDepositAmount] = useState<bigint | null>(null);
  const [convenienceRewardTimePeriod, setConvenienceRewardTimePeriod] = useState<bigint | null>(null);
  const [depositCounter, setDepositCounter] = useState<bigint | null>(null);

  const [shouldFetchRampState, setShouldFetchRampState] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // uint256 public minDepositAmount;
  const {
    data: minimumDepositAmountRaw,
    // isLoading: isMinimumDepositAmountLoading,
    // isError: isMinimumDepositAmountError,
    // refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'minDepositAmount',
    enabled: shouldFetchRampState
  })

  // uint256 public convenienceRewardTimePeriod;
  const {
    data: convenienceRewardTimePeriodRaw,
    // isLoading: isConvenienceRewardTimePeriodLoading,
    // isError: isConvenienceRewardTimePeriodError,
    // refetch: refetchDeposits,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'convenienceRewardTimePeriod',
    enabled: shouldFetchRampState
  })

  // uint256 public depositCounter;
  const {
    data: depositCounterRaw,
    // isLoading: isDepositCounterLoading,
    // isError: isDepositCounterError,
    refetch: refetchDepositCounter,
  } = useContractRead({
    address: rampAddress,
    abi: rampAbi,
    functionName: 'depositCounter',
    enabled: shouldFetchRampState
  })

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('shouldFetchRampState_1');
    esl && console.log('checking rampAddress: ', rampAddress);

    if (rampAddress) {
      esl && console.log('shouldFetchRampState_2');

      setShouldFetchRampState(true);
    } else {
      esl && console.log('shouldFetchRampState_3');

      setShouldFetchRampState(false);

      setMinimumDepositAmount(null);
      setConvenienceRewardTimePeriod(null);
      setDepositCounter(null);
    }
  }, [rampAddress]);

  useEffect(() => {
    esl && console.log('minDepositAmountRaw_1');
    esl && console.log('checking minimumDepositAmountRaw: ', minimumDepositAmountRaw);
  
    if (minimumDepositAmountRaw) {
      esl && console.log('minDepositAmountRaw_2');

      const minimumDepositAmountProcessed = (minimumDepositAmountRaw as bigint);
      
      setMinimumDepositAmount(minimumDepositAmountProcessed);
    } else {
      esl && console.log('minDepositAmountRaw_3');

      setMinimumDepositAmount(null);
    }
  }, [minimumDepositAmountRaw]);

  useEffect(() => {
    esl && console.log('convenienceRewardTimePeriodRaw_1');
    esl && console.log('checking convenienceRewardTimePeriodRaw: ', convenienceRewardTimePeriodRaw);
  
    if (convenienceRewardTimePeriodRaw) {
      esl && console.log('convenienceRewardTimePeriodRaw_2');

      const convenienceRewardTimePerioProcessed = convenienceRewardTimePeriodRaw as bigint;

      setConvenienceRewardTimePeriod(convenienceRewardTimePerioProcessed);
    } else {
      esl && console.log('convenienceRewardTimePeriodRaw_3');

      setConvenienceRewardTimePeriod(null);
    }
  }, [convenienceRewardTimePeriodRaw]);

  useEffect(() => {
    esl && console.log('depositCounterRaw_1');
    esl && console.log('checking depositCounterRaw: ', depositCounterRaw);
  
    if (depositCounterRaw || depositCounterRaw === ZERO) { // BigInt(0) is falsy)
      esl && console.log('depositCounterRaw_2');
      
      setDepositCounter(depositCounterRaw as bigint);
    } else {
      esl && console.log('depositCounterRaw_3');
      
      setDepositCounter(null);
    }
  }, [depositCounterRaw]);

  return (
    <RampContext.Provider
      value={{
        minimumDepositAmount,
        convenienceRewardTimePeriod,
        depositCounter,
        refetchDepositCounter
      }}
    >
      {children}
    </RampContext.Provider>
  );
};

export default RampProvider
