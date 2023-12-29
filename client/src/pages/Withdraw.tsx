import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Withdraw"
import useBalances from '@hooks/useBalance';
import useLegacyDeposits from '@hooks/useLegacyDeposits';


export const Withdraw: React.FC = () => {
  /*
   * Contexts
   */

  const { refetchDeposits, shouldFetchDeposits } = useLegacyDeposits();
  const { refetchUsdcBalance, shouldFetchUsdcBalance } = useBalances();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchDeposits) {
      refetchDeposits?.();
    }

    if (shouldFetchUsdcBalance) {
      refetchUsdcBalance?.();
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

