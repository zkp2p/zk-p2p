import React from 'react';
import styled from "styled-components";

import { ThemedText } from '../theme/text';
import { Button } from '@components/Button';


export const MobileLandingPage: React.FC = () => {
  /*
   * Helpers
   */

  const handleJoinTelegramClicked = () => {
    window.open('https://t.me/+XDj9FNnW-xs5ODNl', '_blank');
  };
  
  /*
   * Component
   */

  return (
    <Container>
      <Logo>
        <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="logo" />
      </Logo>

      <ModalContainer>
        <ThemedText.HeadlineMedium style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
          Sorry!
        </ThemedText.HeadlineMedium>

        <ThemedText.SubHeader style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
          ZKP2P is not yet optimized for mobile devices. Please use a desktop for the best experience and join our Telegram for updates on mobile support.
        </ThemedText.SubHeader>

        <Button
          onClick={handleJoinTelegramClicked}
          fullWidth={true}
        >
          Join our Telegram
        </Button>
      </ModalContainer>
    </Container>
  );
};

const Container = styled.div`
  height: calc(100vh - 76px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 32px;
`;

const ModalContainer = styled.div`
  width: 50%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  background: #0D111C;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  margin-top: auto;
  margin-bottom: auto;
`;

const Logo = styled.div`
  img {
    width: 44px;
    height: 44px;
    object-fit: cover;
  }
`;

