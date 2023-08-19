import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { useAccount } from "wagmi";

import { AutoColumn } from '../layouts/Column'
import { NewPosition } from './NewPosition'
import { PositionTable } from './PositionTable'
import { IntentTable } from './OffRamperIntentTable'
import { Intent } from "../../helpers/types";
import { OffRamperProof } from './OffRamperProof'
import { OffRamperSubmit } from './OffRamperSubmit'


export default function PoolTable() {
  const { address } = useAccount();

  /*
    State
  */
  const [ethereumAddress, setEthereumAddress] = useState<string>(address ?? "");
  const [isAddPosition, setIsAddPosition] = useState<boolean>(false);

  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  const [submitOrderPublicSignals, setSubmitOrderPublicSignals] = useState<string>('');
  const [submitOrderProof, setSubmitOrderProof] = useState<string>('');

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

  /*
    Hooks
  */

  useEffect(() => {
    if (address) {
      setEthereumAddress(address);
    } else {
      setEthereumAddress("");
    }
  }, [address]);

  function renderContent() {
    if (isAddPosition) {
      return (
        <NewPositionContainer>
          <NewPosition
            loggedInWalletAddress={'0x123'}
            handleBackClick={handleBackClickOnNewDeposit}
          />
        </NewPositionContainer>
      );
    }
  
    if (selectedIntent) {
      return (
        <OffRampProofContainer>
          <OffRamperProof
            loggedInWalletAddress={ethereumAddress}
            setSubmitOrderProof={setSubmitOrderProof}
            setSubmitOrderPublicSignals={setSubmitOrderPublicSignals}
            handleBackClick={handleBackClickOnProof}
          />
          <OffRamperSubmit
            proof={submitOrderProof}
            publicSignals={submitOrderPublicSignals}
          />
        </OffRampProofContainer>
      );
    }
  
    return (
      <DepositAndIntentContainer>
        <PositionTable
          loggedInWalletAddress={ethereumAddress}
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


const OffRampProofContainer = styled.div`
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);  
  background-color: #0D111C;
  gap: 1rem;
  padding: 1.5rem;
  align-self: flex-start;
  justify-content: center;
`;
