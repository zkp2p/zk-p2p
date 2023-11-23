import React, { useEffect } from 'react';
import styled from 'styled-components/macro'

import { AutoColumn } from '../layouts/Column'
import { DepositsTable } from './DepositsTable'
import { DEPOSIT_REFETCH_INTERVAL } from '@helpers/constants'
import useLiquidity from '@hooks/useLiquidity';
import useRampState from '@hooks/useRampState';


export default function Deposit() {
  /*
   * Contexts
   */

  const { refetchDepositCounter, shouldFetchRampState } = useRampState();
  const { refetchDeposits, shouldFetchDeposits } = useLiquidity();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchDeposits) {
      const intervalId = setInterval(() => {
        refetchDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchDeposits, refetchDeposits]);

  useEffect(() => {
    if (shouldFetchRampState) {
      const intervalId = setInterval(() => {
        refetchDepositCounter?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchRampState, refetchDepositCounter]);

  /*
   * Component
   */

  return (
    <Wrapper>
      <main>
        <DepositsTable/>
      </main>
    </Wrapper>
  );
};

const Wrapper = styled(AutoColumn)`
  max-width: 920px;
  width: 100%;
  padding-top: 1.5rem;
`;
