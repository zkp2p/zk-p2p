import React, { useState } from 'react';
import styled from "styled-components";

import SwapModal from "../components/Swap"
import { OnRamperProof } from '../components/Swap/OnRamperProof'
import { OnRamperSubmit } from '../components/Swap/OnRamperSubmit'
import { Intent } from "../helpers/types";
import AccountContext from '../contexts/Account/AccountContext';


export const Swap: React.FC<{}> = (props) => {
  /*
   * Context
   */
  const { ethereumAddress } = React.useContext(AccountContext);

  /*
   * State
   */
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  const [submitOrderPublicSignals, setSubmitOrderPublicSignals] = useState<string>('');
  const [submitOrderProof, setSubmitOrderProof] = useState<string>('');

  /*
   * Handlers
   */
  const handleBackClick = () => {
    setSelectedIntent(null);
  }

  const handleIntentClick = (rowData: any[]) => {
    // No-op
    console.log('row data: ', rowData);

    setSelectedIntent(rowData[0]);
  };

  return (
    <PageWrapper>
      {!selectedIntent ? (
        <SwapModal
          onIntentTableRowClick={handleIntentClick}
        />
        ) : (
        <OnRampProofContainer>
          <Column>
            <OnRamperProof
              loggedInWalletAddress={ethereumAddress}
              setSubmitOrderProof={setSubmitOrderProof}
              setSubmitOrderPublicSignals={setSubmitOrderPublicSignals}
              handleBackClick={handleBackClick}
            />
            <OnRamperSubmit
              proof={submitOrderProof}
              publicSignals={submitOrderPublicSignals}
            />
          </Column>
        </OnRampProofContainer>
      )}
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;
  align-items: center;
  justify-content: center;
`;

const OnRampProofContainer = styled.div`
  max-width: 660px;
  padding-top: 1.5rem;
`;
  
const Column = styled.div`
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);  
  background-color: #0D111C;
  gap: 1rem;
  padding: 1.5rem;
  align-self: flex-start;
  justify-content: center;
`;
