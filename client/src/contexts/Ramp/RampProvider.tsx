import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { fromUsdc } from '../../helpers/units'
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
  const [minimumDepositAmount, setMinimumDepositAmount] = useState<number>(0);
  const [convenienceRewardTimePeriod, setConvenienceRewardTimePeriod] = useState<number>(0);
  const [depositCounter, setDepositCounter] = useState<number>(0);

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
      const minimumDepositAmountProcessed = fromUsdc(minimumDepositAmountRaw.toString()).toNumber();
      console.log('minimumDepositAmountProcessed');
      console.log(minimumDepositAmountProcessed);
      setMinimumDepositAmount(minimumDepositAmountProcessed);
    } else {
      setMinimumDepositAmount(0);
    }
  }, [isLoggedIn, minimumDepositAmountRaw]);

  useEffect(() => {
    console.log('convenienceRewardTimePeriodRaw_1');
    console.log(convenienceRewardTimePeriodRaw);
  
    if (isLoggedIn && convenienceRewardTimePeriodRaw) {
      const convenienceRewardTimePerioProcessed = fromUsdc(convenienceRewardTimePeriodRaw.toString()).toNumber();
      console.log('convenienceRewardTimePerioProcessed');
      console.log(convenienceRewardTimePerioProcessed);
      setConvenienceRewardTimePeriod(convenienceRewardTimePerioProcessed);
    } else {
      setConvenienceRewardTimePeriod(0);
    }
  }, [isLoggedIn, convenienceRewardTimePeriodRaw]);

  useEffect(() => {
    console.log('depositCounterRaw_1');
    console.log(depositCounterRaw);
  
    if (isLoggedIn && depositCounterRaw) {
      const depositCounterProcessed = depositCounterRaw as number;
      console.log('depositCounterProcessed');
      console.log(depositCounterProcessed);
      setDepositCounter(depositCounterProcessed);
    } else {
      setDepositCounter(0);
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
