import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Deposit"
import useDeposits from '@hooks/useDeposits';


export const Deposit: React.FC<{}> = (props) => {
  /*
   * Contexts
   */

  const {
    refetchDeposits,
    shouldFetchDeposits,
    refetchDepositIntents,
    shouldFetchDepositIntents,
  } = useDeposits();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchDeposits) {
      refetchDeposits?.();
    }

    if (shouldFetchDepositIntents) {
      refetchDepositIntents?.();
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

