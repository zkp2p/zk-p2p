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
      <ModalContainer>
        <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
          Sorry!
        </ThemedText.HeadlineSmall>

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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ModalContainer = styled.div`
  width: 65%;
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
  position: absolute;
  top: 200px;
`;
