import React, { useState } from 'react';
import styled from 'styled-components/macro'

import { AutoColumn } from '../layouts/Column'
import { NewPosition } from './NewPosition'
import { PositionTable } from './PositionTable'
import { IntentTable } from './OffRamperIntentTable'
import { OffRamp } from './OffRamp'
import useDeposits from '@hooks/useDeposits';


export default function Deposit() {
  /*
    Contexts
  */
  const { deposits, depositIntents } = useDeposits()

  /*
    State
  */
  const [isAddPosition, setIsAddPosition] = useState<boolean>(false);

  const [selectedIntentHash, setSelectedIntentHash] = useState<string | null>(null);

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
    setSelectedIntentHash(null);
  }

  const handleIntentClick = (rowData: any[]) => {
    const selectedIntentIndex = rowData[0];
    const intentHashes = [...new Set((deposits).flatMap((deposit: any) => deposit.intentHashes))]

    const selectedIntentHash = intentHashes[selectedIntentIndex];
    console.log('selectedIntentHash', selectedIntentHash);

    setSelectedIntentHash(selectedIntentHash);
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
  
    if (selectedIntentHash) {
      return (
        <OffRamp
          handleBackClick={handleBackClickOnProof}
          selectedIntentHash={selectedIntentHash}
        />
      );
    }
  
    return (
      <DepositAndIntentContainer>
        <PositionTable
          handleNewPositionClick={handleUpdateClick}
        />
        {depositIntents && depositIntents.length > 0 ? (
          <IntentTable
            onRowClick={handleIntentClick}
          />
        ) : null}
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
