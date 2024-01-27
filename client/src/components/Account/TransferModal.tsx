import React from 'react';
import styled from 'styled-components/macro';

import { AutoColumn } from '@components/layouts/Column';
import { LegacyDepositTable } from '@components/Withdraw/LegacyDepositTable';


export default function TransferModal() {
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
