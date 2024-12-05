import React, { useEffect, useState, ReactNode } from 'react'
import { useContractRead } from 'wagmi'

import { esl, CALLER_ACCOUNT, ZERO } from '@helpers/constants'
import useSmartContracts from '@hooks/useSmartContracts';

import { EscrowContext } from './index'


interface ProvidersProps {
  children: ReactNode;
}

const EscrowProvider = ({ children }: ProvidersProps) => {
  /*
   * Contexts
   */

  const { escrowAddress, escrowAbi } = useSmartContracts();

  /*
   * State
   */

  const [depositCounter, setDepositCounter] = useState<bigint | null>(null);
  const [shouldFetchEscrowState, setShouldFetchEscrowState] = useState<boolean>(false);

  /*
   * Contract Reads
   */

  // uint256 public depositCounter;
  const {
    data: depositCounterRaw,
    refetch: refetchDepositCounter,
  } = useContractRead({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: 'depositCounter',
    enabled: shouldFetchEscrowState,
    account: CALLER_ACCOUNT
  })

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('escrow_shouldFetchEscrowState_1');
    esl && console.log('checking escrowAddress: ', escrowAddress);

    if (escrowAddress) {
      esl && console.log('escrow_shouldFetchEscrowState_2');

      setShouldFetchEscrowState(true);
    } else {
      esl && console.log('escrow_shouldFetchEscrowState_3');

      setShouldFetchEscrowState(false);
      setDepositCounter(null);
    }
  }, [escrowAddress]);

  useEffect(() => {
    esl && console.log('escrow_depositCounterRaw_1');
    esl && console.log('checking depositCounterRaw: ', depositCounterRaw);
  
    if (depositCounterRaw || depositCounterRaw === ZERO) { // BigInt(0) is falsy)
      esl && console.log('escrow_depositCounterRaw_2');
      
      setDepositCounter(depositCounterRaw as bigint);
    } else {
      esl && console.log('escrow_depositCounterRaw_3');
      
      setDepositCounter(null);
    }
  }, [depositCounterRaw]);

  return (
    <EscrowContext.Provider
      value={{
        depositCounter,
        refetchDepositCounter,
        shouldFetchEscrowState
      }}
    >
      {children}
    </EscrowContext.Provider>
  );
};

export default EscrowProvider
