import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft, Unlock } from 'react-feather';
import { usePrivy } from '@privy-io/react-auth';

import { Button } from "@components/common/Button";
import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'


interface AccountSelectorProps {
  onBackClick: () => void
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
    onBackClick
  }) => {
  /*
   * Contexts
   */

  const { connectWallet, login } = usePrivy();

  
  /*
  * Handlers
  */
  const handleOverlayClick = () => {
    onBackClick();
  }

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay onClick={handleOverlayClick} />

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
            {'Create Account or Sign In'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <Button
            onClick={login}
            fullWidth={true}
        >
            Login using Email
        </Button>
        <Button
            onClick={connectWallet}
            fullWidth={true}
        >
            Login using Wallet
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
  z-index: 30;
`;

const ModalContainer = styled.div`
  width: 472px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0D111C;
  justify-content: space-between;
  align-items: center;
  z-index: 40;
  gap: 1.3rem;
  top: 33%;
  position: relative;
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