import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Liquidity"
import useVenmoRampState from '@hooks/useRampState';
import useVenmoLiquidity from '@hooks/useLiquidity';

import useHdfcRampState from '@hooks/hdfc/useHdfcRampState';
import useHdfcLiquidity from '@hooks/hdfc/useHdfcLiquidity';


export const Liquidity: React.FC = () => {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper>
      <Main>
        <DepositTable />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  padding-bottom: 3rem;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

