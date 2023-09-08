import React, { useState } from 'react';
import styled from 'styled-components/macro'

import { AutoColumn } from '../layouts/Column'
import { NewPosition } from './NewPosition'
import { PositionTable } from './PositionTable'
import { IntentTable } from './OffRamperIntentTable'
import { Intent } from "../../contexts/Deposits/types";
import { OffRamp } from './OffRamp'


export default function Deposit() {
  /*
    State
  */
  const [isAddPosition, setIsAddPosition] = useState<boolean>(false);

  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  /*
    Handlers
  */
  const handleUpdateClick = () => {
    setIsAddPosition(true);
  }

  const handleBackClickOnNewDeposit = () => {
    setIsAddPosition(false);
  }
  const handleBackClickOnProof = () => {
    setSelectedIntent(null);
  }

  const handleIntentClick = (rowData: any[]) => {
    // No-op
    console.log('row data: ', rowData);

    setSelectedIntent(rowData[0]);
  };

  function renderContent() {
    if (isAddPosition) {
      return (
        <NewPositionContainer>
          <NewPosition
            handleBackClick={handleBackClickOnNewDeposit}
          />
        </NewPositionContainer>
      );
    }
  
    if (selectedIntent) {
      return (
        <OffRamp
          handleBackClick={handleBackClickOnProof}
        />
      );
    }
  
    return (
      <DepositAndIntentContainer>
        <PositionTable
          handleNewPositionClick={handleUpdateClick}
        />
        <IntentTable
          onRowClick={handleIntentClick}
        />
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
  padding-top: 1.5rem;
  gap: 1rem;
`

const DepositAndIntentContainer = styled.div`
  display: grid;
  gap: 1rem;
  border-radius: 16px;
`;

const Content = styled.main`
  gap: 1rem;
`;

const NewPositionContainer = styled.div`
  display: grid;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;
