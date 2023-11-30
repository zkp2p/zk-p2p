import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Liquidity"
import useRampState from '@hooks/useRampState';
import useDeposits from '@hooks/useDeposits';


export const Liquidity: React.FC<{}> = (props) => {
  /*
   * Contexts
   */

  const { refetchDepositCounter, shouldFetchRampState } = useRampState();
  const { refetchDeposits, shouldFetchDeposits } = useDeposits();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchRampState) {
      refetchDepositCounter?.();
    }

    if (shouldFetchDeposits) {
      refetchDeposits?.();
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

