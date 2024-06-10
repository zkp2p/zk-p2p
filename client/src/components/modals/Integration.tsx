import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft, Mail } from 'react-feather';

import { Button } from "@components/common/Button";
import { Overlay } from '@components/modals/Overlay';
import { commonStrings } from '@helpers/strings';
import useQuery from '@hooks/useQuery';
import { ThemedText } from '@theme/text'
import { colors } from '@theme/colors';

interface IntegrationProps {
  onBackClick: () => void
}

export const Integration: React.FC<IntegrationProps> = ({
  onBackClick,
}) => {
  /*
   * Contexts
   */

  const { getQuery } = useQuery();

  const appIdFromQuery = getQuery('appId');
  const recipientAddressFromQuery = getQuery('recipientAddress');

  

  /*
   * State
   */

  const [transactionAddress, setTransactionAddress] = useState<string>("");

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  }

  /*
   * Hooks
   */


  /*
   * Helpers
   */

  
  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay />

      <ModalContainer>
        <TitleCenteredRow>
          <div style={{ flex: 0.25 }}>
            <button
              onClick={handleOverlayClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >

              <StyledArrowLeft/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            Onramp to {appIdFromQuery}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <StyledMail />

        <InstructionsContainer>
          <InstructionsLabel>
            Powered by ZKP2P
          </InstructionsLabel>
          {recipientAddressFromQuery && (
            <InstructionsLabel>
              You are onramping to {recipientAddressFromQuery} on {appIdFromQuery}
            </InstructionsLabel>
          )}
        </InstructionsContainer>


        <Button
          onClick={onBackClick}
        >
          Continue
        </Button>
      </ModalContainer>
    </ModalAndOverlayContainer>
  );
};

const ModalAndOverlayContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  align-items: flex-start;
  top: 0;
  left: 0;
  z-index: 10;
`;

const ModalContainer = styled.div`
  width: 472px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background-color: ${colors.container};
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  gap: 1.3rem;
  
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const TitleCenteredRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  color: #FFF;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const StyledMail = styled(Mail)`
  width: 56px;
  height: 56px;
  color: #FFF;
  padding: 0.5rem 0;
`;

const InstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 0 1.75rem;
  color: #FFF;
`;

const InstructionsLabel = styled.div`
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
`;

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
