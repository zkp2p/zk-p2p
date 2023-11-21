import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Liquidity"
import useRampState from '@hooks/useRampState';


export const Liquidity: React.FC<{}> = (props) => {
  /*
   * Contexts
   */

  const {
    refetchDepositCounter,
    shouldFetchRampState
  } = useRampState();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchRampState) {
      refetchDepositCounter?.();
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

