import React, { useEffect } from 'react';
import styled from 'styled-components/macro';

import { AutoColumn } from '@components/layouts/Column';
import { DepositsTable } from '@components/Liquidity/DepositsTable';
import { DEPOSIT_REFETCH_INTERVAL } from '@helpers/constants';
import useVenmoLiquidity from '@hooks/venmo/useLiquidity';
import useVenmoRampState from '@hooks/venmo/useRampState';
import useHdfcRampState from '@hooks/hdfc/useRampState';
import useHdfcLiquidity from '@hooks/hdfc/useLiquidity';
import useGarantiRampState from '@hooks/garanti/useRampState';
import useGarantiLiquidity from '@hooks/garanti/useLiquidity';
import useWiseRampState from '@hooks/wise/useRampState';
import useWiseLiquidity from '@hooks/wise/useLiquidity';


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

  const {
    refetchDepositCounter: refetchGarantiDepositCounter,
    shouldFetchRampState: shouldFetchGarantiRampState
  } = useGarantiRampState();
  const {
    refetchDeposits: refetchGarantiDeposits,
    shouldFetchDeposits: shouldFetchGarantiDeposits
  } = useGarantiLiquidity();

  const {
    refetchDepositCounter: refetchWiseDepositCounter,
    shouldFetchRampState: shouldFetchWiseRampState
  } = useWiseRampState();
  const {
    refetchDeposits: refetchWiseDeposits,
    shouldFetchDeposits: shouldFetchWiseDeposits
  } = useWiseLiquidity();

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

  useEffect(() => {
    if (shouldFetchGarantiDeposits) {
      const intervalId = setInterval(() => {
        refetchGarantiDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchGarantiDeposits, refetchGarantiDeposits]);

  useEffect(() => {
    if (shouldFetchGarantiRampState) {
      const intervalId = setInterval(() => {
        refetchGarantiDepositCounter?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchGarantiRampState, refetchGarantiDepositCounter]);

  useEffect(() => {
    if (shouldFetchWiseDeposits) {
      const intervalId = setInterval(() => {
        refetchWiseDeposits?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchWiseDeposits, refetchWiseDeposits]);

  useEffect(() => {
    if (shouldFetchWiseRampState) {
      const intervalId = setInterval(() => {
        refetchWiseDepositCounter?.();
      }, DEPOSIT_REFETCH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [shouldFetchWiseRampState, refetchWiseDepositCounter]);

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
