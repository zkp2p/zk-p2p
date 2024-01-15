import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft, Unlock } from 'react-feather';
import { usePrivy } from '@privy-io/react-auth';
import { useDisconnect } from 'wagmi';

import { Button } from "@components/common/Button";
import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'


interface AccountDetailsProps {
  onBackClick: () => void,
  isExternalEOA: boolean
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({
    onBackClick,
    isExternalEOA
  }) => {
  /*
   * Contexts
   */

  const { logout } = usePrivy();
  const { disconnect } = useDisconnect();
  
  /*
  * Handlers
  */
  const handleOverlayClick = () => {
    onBackClick();
  }

  const handleLogout = async () => {
    try {
      await logout();
      await disconnect();
  
      onBackClick();
    } catch (error) {
      console.error("Failed to logout");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
  
      onBackClick();
    } catch (error) {
      console.error("Failed to disconnect wallet");
    }
  };

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
            {'Sign out'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <Button
          onClick={isExternalEOA ? handleDisconnect : handleLogout}
          fullWidth={true}
        >
          Logout
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