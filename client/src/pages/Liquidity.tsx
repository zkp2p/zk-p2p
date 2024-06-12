import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Liquidity"
import useVenmoRampState from '@hooks/venmo/useRampState';
import useVenmoLiquidity from '@hooks/venmo/useLiquidity';
import useHdfcRampState from '@hooks/hdfc/useRampState';
import useHdfcLiquidity from '@hooks/hdfc/useLiquidity';
import useGarantiRampState from '@hooks/garanti/useRampState';
import useGarantiLiquidity from '@hooks/garanti/useLiquidity';
import useMediaQuery from '@hooks/useMediaQuery';


export const Liquidity: React.FC = () => {
  /*
   * Contexts
   */

  const currentDeviceSize = useMediaQuery();

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

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchVenmoRampState) {
      refetchVenmoDepositCounter?.();
    }

    if (shouldFetchVenmoDeposits) {
      refetchVenmoDeposits?.();
    }

    if (shouldFetchHdfcRampState) {
      refetchHdfcDepositCounter?.();
    }

    if (shouldFetchHdfcDeposits) {
      refetchHdfcDeposits?.();
    }

    if (shouldFetchGarantiRampState) {
      refetchGarantiDepositCounter?.();
    }

    if (shouldFetchGarantiDeposits) {
      refetchGarantiDeposits?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper $isMobile={currentDeviceSize === 'tablet' || currentDeviceSize === 'mobile'}>
      <Main>
        <DepositTable />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding-bottom: 7rem;
  
  @media (min-width: 600px) {
    padding: 12px 8px;
    padding-bottom: 3rem;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

