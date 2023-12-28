import React, { useEffect } from 'react';
import styled from 'styled-components/macro';

import { AutoColumn } from '@components/layouts/Column';
import { DepositsTable } from '@components/Liquidity/DepositsTable';
import { DEPOSIT_REFETCH_INTERVAL } from '@helpers/constants';
import useVenmoLiquidity from '@hooks/venmo/useLiquidity';
import useVenmoRampState from '@hooks/venmo/useRampState';
import useHdfcRampState from '@hooks/hdfc/useRampState';
import useHdfcLiquidity from '@hooks/hdfc/useLiquidity';


export default function Deposit() {
  /*
   * Contexts
   */

  const {
    refetchDepositCounter: refetchVenmoDepositCounter,
    shouldFetchRampState: shouldFetchVenmoRampState
  } = useVenmoRampState();
  const {
    refetchDeposits: refetchVenmoDeposits,
    shouldFetchDeposits: shouldFetchVenmoDeposits
  } = useVenmoLiquidity();

  const {
    refetchDepositCounter: refetchHdfcDepositCounter,
    shouldFetchRampState: shouldFetchHdfcRampState
  } = useHdfcRampState();
  const {
    refetchDeposits: refetchHdfcDeposits,
    shouldFetchDeposits: shouldFetchHdfcDeposits
  } = useHdfcLiquidity();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchVenmoDeposits) {
      const intervalId = setInterval(() => {
        refetchVenmoDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchVenmoDeposits, refetchVenmoDeposits]);

  useEffect(() => {
    if (shouldFetchVenmoRampState) {
      const intervalId = setInterval(() => {
        refetchVenmoDepositCounter?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchVenmoRampState, refetchVenmoDepositCounter]);

  useEffect(() => {
    if (shouldFetchHdfcDeposits) {
      const intervalId = setInterval(() => {
        refetchHdfcDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchHdfcDeposits, refetchHdfcDeposits]);

  useEffect(() => {
    if (shouldFetchHdfcRampState) {
      const intervalId = setInterval(() => {
        refetchHdfcDepositCounter?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchHdfcRampState, refetchHdfcDepositCounter]);

  /*
   * Component
   */

  return (
    <Wrapper>
      <DepositsTable/>
    </Wrapper>
  );
};

const Wrapper = styled(AutoColumn)`
  max-width: 920px;
  width: 100%;
`;
