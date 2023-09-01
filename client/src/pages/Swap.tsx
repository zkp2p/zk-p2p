import React, { useState } from 'react';
import styled from "styled-components";

import SwapModal from "../components/Swap"
import { OnRamp } from '../components/Swap/OnRamp'
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
          loggedInWalletAddress={ethereumAddress}
          onIntentTableRowClick={handleIntentClick}
        />
        ) : (
        <OnRampContainer>
          <OnRamp
            handleBackClick={handleBackClick}
          />
        </OnRampContainer>
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

const OnRampContainer = styled.div`
  max-width: 660px;
  padding-top: 1.5rem;
`;
