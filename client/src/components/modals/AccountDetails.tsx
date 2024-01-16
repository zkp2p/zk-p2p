import React from "react";
import styled from 'styled-components';
import { ArrowLeft, LogOut } from 'react-feather';
import { usePrivy } from '@privy-io/react-auth';
import { useDisconnect } from 'wagmi';

import { Button } from "@components/common/Button";
import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'

import useBalances from '@hooks/useBalance';
 
interface AccountDetailsProps {
  onBackClick: () => void
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({
    onBackClick
  }) => {
  /*
   * Contexts
   */

  const { ready, authenticated, logout } = usePrivy();
  const { disconnect } = useDisconnect();
  const { usdcBalance, refetchUsdcBalance } = useBalances();

  /*
  * Handlers
  */
  const handleOverlayClick = () => {
    onBackClick();
  }

  const handleLogout = async () => {
    try {
      await disconnect();
      await logout();
  
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
            {'Account'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <StyledLogOut />

        { ready && authenticated ? (
          <EmbeddedWalletContainer>
            <Button
              // onClick={handleLogout}
              fullWidth={true}
            >
              Send USDC
            </Button>
            <Button
              onClick={handleLogout}
              fullWidth={true}
            >
              Logout
            </Button>
          </EmbeddedWalletContainer>
        ) : (
          <Button
            onClick={handleDisconnect}
            fullWidth={true}
          >
            Disconnect
          </Button>
        )}

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

const EmbeddedWalletContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 0 1.75rem;
  color: #FFF;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const StyledLogOut = styled(LogOut)`
  width: 36px;
  height: 26px;
  color: #FFF;
  padding: 0.25rem 0;
`;