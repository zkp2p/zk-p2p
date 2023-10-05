import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import useAccount from '@hooks/useAccount'
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
    // refetch: refetchDeposits,
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
    // console.log('shouldFetchRampState_1');
    if (rampAddress) {
      // console.log('shouldFetchRampState_2');
      setShouldFetchRampState(true);
    } else {
      // console.log('shouldFetchRampState_3');
      setShouldFetchRampState(false);

      setMinimumDepositAmount(null);
      setConvenienceRewardTimePeriod(null);
      setDepositCounter(null);
    }
  }, [rampAddress]);

  useEffect(() => {
    // console.log('minDepositAmountRaw_1');
  
    if (minimumDepositAmountRaw) {
      // console.log('minDepositAmountRaw_2');
      // console.log(minimumDepositAmountRaw);

      const minimumDepositAmountProcessed = (minimumDepositAmountRaw as bigint);
      
      setMinimumDepositAmount(minimumDepositAmountProcessed);
    } else {
      console.log('minDepositAmountRaw_3');
      setMinimumDepositAmount(null);
    }
  }, [minimumDepositAmountRaw]);

  useEffect(() => {
    // console.log('convenienceRewardTimePeriodRaw_1');
  
    if (convenienceRewardTimePeriodRaw) {
      // console.log('convenienceRewardTimePeriodRaw_2');
      // console.log(convenienceRewardTimePeriodRaw);

      const convenienceRewardTimePerioProcessed = convenienceRewardTimePeriodRaw as bigint;

      setConvenienceRewardTimePeriod(convenienceRewardTimePerioProcessed);
    } else {
      // console.log('convenienceRewardTimePeriodRaw_3');
      setConvenienceRewardTimePeriod(null);
    }
  }, [convenienceRewardTimePeriodRaw]);

  useEffect(() => {
    // console.log('depositCounterRaw_1');
  
    if (depositCounterRaw) {
      // console.log('depositCounterRaw_2');
      // console.log(depositCounterRaw);
      
      setDepositCounter(depositCounterRaw as bigint);
    } else {
      // console.log('depositCounterRaw_3');
      setDepositCounter(null);
    }
  }, [depositCounterRaw]);

  return (
    <RampContext.Provider
      value={{
        minimumDepositAmount,
        convenienceRewardTimePeriod,
        depositCounter,
      }}
    >
      {children}
    </RampContext.Provider>
  );
};

export default RampProvider
