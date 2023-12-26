import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { esl, CALLER_ACCOUNT, ZERO } from '@helpers/constants'
import useSmartContracts from '@hooks/useSmartContracts';

import RampContext from './RampContext'


interface ProvidersProps {
  children: ReactNode;
}

const RampProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { venmoRampAddress, venmoRampAbi } = useSmartContracts();

  /*
   * State
   */

  const [minimumDepositAmount, setMinimumDepositAmount] = useState<bigint | null>(null);
  const [depositCounter, setDepositCounter] = useState<bigint | null>(null);
  const [onRampCooldownPeriod, setOnRampCooldownPeriod] = useState<bigint | null>(null);

  const [shouldFetchRampState, setShouldFetchRampState] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // uint256 public minDepositAmount;
  const {
    data: minimumDepositAmountRaw,
  } = useContractRead({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'minDepositAmount',
    enabled: shouldFetchRampState,
    account: CALLER_ACCOUNT
  })

  // uint256 public depositCounter;
  const {
    data: depositCounterRaw,
    refetch: refetchDepositCounter,
  } = useContractRead({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'depositCounter',
    enabled: shouldFetchRampState,
    account: CALLER_ACCOUNT
  })

  // uint256 public onRampCooldownPeriod;
  const {
    data: onRampCooldownPeriodRaw,
  } = useContractRead({
    address: venmoRampAddress,
    abi: venmoRampAbi,
    functionName: 'onRampCooldownPeriod',
    enabled: shouldFetchRampState,
    account: CALLER_ACCOUNT
  })

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('venmo_shouldFetchRampState_1');
    esl && console.log('checking venmoRampAddress: ', venmoRampAddress);

    if (venmoRampAddress) {
      esl && console.log('venmo_shouldFetchRampState_2');

      setShouldFetchRampState(true);
    } else {
      esl && console.log('venmo_shouldFetchRampState_3');

      setShouldFetchRampState(false);

      setMinimumDepositAmount(null);
      setDepositCounter(null);
    }
  }, [venmoRampAddress]);

  useEffect(() => {
    esl && console.log('venmo_minDepositAmountRaw_1');
    esl && console.log('checking minimumDepositAmountRaw: ', minimumDepositAmountRaw);
  
    if (minimumDepositAmountRaw) {
      esl && console.log('venmo_minDepositAmountRaw_2');

      const minimumDepositAmountProcessed = (minimumDepositAmountRaw as bigint);
      
      setMinimumDepositAmount(minimumDepositAmountProcessed);
    } else {
      esl && console.log('venmo_minDepositAmountRaw_3');

      setMinimumDepositAmount(null);
    }
  }, [minimumDepositAmountRaw]);

  useEffect(() => {
    esl && console.log('venmo_depositCounterRaw_1');
    esl && console.log('checking depositCounterRaw: ', depositCounterRaw);
  
    if (depositCounterRaw || depositCounterRaw === ZERO) { // BigInt(0) is falsy)
      esl && console.log('venmo_depositCounterRaw_2');
      
      setDepositCounter(depositCounterRaw as bigint);
    } else {
      esl && console.log('venmo_depositCounterRaw_3');
      
      setDepositCounter(null);
    }
  }, [depositCounterRaw]);

  useEffect(() => {
    esl && console.log('venmo_onRampCooldownPeriodRaw_1');
    esl && console.log('checking onRampCooldownPeriodRaw: ', onRampCooldownPeriodRaw);
  
    if (onRampCooldownPeriodRaw || onRampCooldownPeriodRaw === ZERO) { // BigInt(0) is falsy)
      esl && console.log('venmo_onRampCooldownPeriodRaw_2');
      
      setOnRampCooldownPeriod(onRampCooldownPeriodRaw as bigint);
    } else {
      esl && console.log('venmo_onRampCooldownPeriodRaw_3');
      
      setOnRampCooldownPeriod(null);
    }
  }, [onRampCooldownPeriodRaw]);

  return (
    <RampContext.Provider
      value={{
        minimumDepositAmount,
        depositCounter,
        onRampCooldownPeriod,
        refetchDepositCounter,
        shouldFetchRampState
      }}
    >
      {children}
    </RampContext.Provider>
  );
};

export default RampProvider
