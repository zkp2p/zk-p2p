import React, { useEffect } from 'react';
import styled from 'styled-components/macro';

import { AutoColumn } from '@components/layouts/Column';
import { LegacyDepositTable } from '@components/Withdraw/LegacyDepositTable';
import { DEPOSIT_REFETCH_INTERVAL } from '@helpers/constants';
import useLegacyDeposits from '@hooks/useLegacyDeposits';


export default function Withdraw() {
  /*
   * Contexts
   */

  const { refetchDeposits, shouldFetchDeposits } = useLegacyDeposits();

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchDeposits]);

  /*
   * Component
   */

  function renderContent() {
    return (
      <DepositAndIntentContainer>
        <LegacyDepositTable/>
      </DepositAndIntentContainer>
    );
  }

  return (
    <Wrapper>
      <Content>
        {renderContent()}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled(AutoColumn)`
  max-width: 660px;
  width: 100%;
`;

const DepositAndIntentContainer = styled.div`
  display: grid;
  border-radius: 16px;
`;

const Content = styled.main`
  gap: 1rem;
`;
