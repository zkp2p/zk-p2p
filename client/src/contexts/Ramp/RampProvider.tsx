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
  const { isLoggedIn } = useAccount()
  const { rampAddress, rampAbi } = useSmartContracts()

  /*
   * State
   */
  const [minimumDepositAmount, setMinimumDepositAmount] = useState<bigint | null>(null);
  const [convenienceRewardTimePeriod, setConvenienceRewardTimePeriod] = useState<bigint | null>(null);
  const [depositCounter, setDepositCounter] = useState<bigint | null>(null);

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
  })

  /*
   * Hooks
   */
  useEffect(() => {
    console.log('minDepositAmountRaw_1');
    console.log(minimumDepositAmountRaw);
  
    if (isLoggedIn && minimumDepositAmountRaw) {
      const minimumDepositAmountProcessed = (minimumDepositAmountRaw as bigint);

      console.log('minimumDepositAmountProcessed');
      console.log(minimumDepositAmountProcessed);
      
      setMinimumDepositAmount(minimumDepositAmountProcessed);
    } else {
      setMinimumDepositAmount(null);
    }
  }, [isLoggedIn, minimumDepositAmountRaw]);

  useEffect(() => {
    console.log('convenienceRewardTimePeriodRaw_1');
    console.log(convenienceRewardTimePeriodRaw);
  
    if (isLoggedIn && convenienceRewardTimePeriodRaw) {
      const convenienceRewardTimePerioProcessed = convenienceRewardTimePeriodRaw as bigint;

      console.log('convenienceRewardTimePerioProcessed');
      console.log(convenienceRewardTimePerioProcessed);

      setConvenienceRewardTimePeriod(convenienceRewardTimePerioProcessed);
    } else {
      setConvenienceRewardTimePeriod(null);
    }
  }, [isLoggedIn, convenienceRewardTimePeriodRaw]);

  useEffect(() => {
    console.log('depositCounterRaw_1');
    console.log(depositCounterRaw);
  
    if (isLoggedIn && depositCounterRaw) {
      setDepositCounter(depositCounterRaw as bigint);
    } else {
      setDepositCounter(null);
    }
  }, [isLoggedIn, depositCounterRaw]);

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
