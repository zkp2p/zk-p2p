import React, { useState } from 'react';
import styled from "styled-components";

import SwapModal from "@components/Swap"
import { OnRamp } from '@components/Swap/OnRamp'
import { Intent } from "../contexts/Deposits/types";
import useOnRamperIntents from '@hooks/useOnRamperIntents';


export const Swap: React.FC<{}> = (props) => {
  /*
    Contexts
  */
  const { currentIntentHash } = useOnRamperIntents()

  /*
   * State
   */
  const [selectedIntentHash, setSelectedIntentHash] = useState<string | null>(null);

  /*
   * Handlers
   */
  const handleBackClick = () => {
    setSelectedIntentHash(null);
  }

  const handleIntentClick = (rowData: any[]) => {
    setSelectedIntentHash(currentIntentHash);
  };

  return (
    <PageWrapper>
      {!selectedIntentHash ? (
        <SwapModal
          onIntentTableRowClick={handleIntentClick}
        />
        ) : (
        <OnRampContainer>
          <OnRamp
            handleBackClick={handleBackClick}
            selectedIntentHash={selectedIntentHash}
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
