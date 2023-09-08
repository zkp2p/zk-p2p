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

  return (
    <RampContext.Provider
      value={{
        minimumDepositAmount,
      }}
    >
      {children}
    </RampContext.Provider>
  );
};

export default RampProvider
