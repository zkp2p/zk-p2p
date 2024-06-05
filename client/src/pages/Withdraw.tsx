import React, { useEffect } from 'react';
import styled from "styled-components";

import DepositTable from "@components/Withdraw"
import useBalances from '@hooks/useBalance';
import useLegacyDeposits from '@hooks/useLegacyDeposits';
import useMediaQuery from '@hooks/useMediaQuery';


export const Withdraw: React.FC = () => {
  /*
   * Contexts
   */

  const currentDeviceSize = useMediaQuery();

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

  @media (min-width: 600px) {
    padding: 12px 8px;
  }

  padding-bottom: ${props => props.$isMobile ? '7rem' : '3rem'};
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
