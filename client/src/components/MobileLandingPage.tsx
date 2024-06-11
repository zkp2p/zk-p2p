import React from 'react';
import styled from "styled-components";

import { Overlay } from '@components/modals/Overlay';
import { Button } from '@components/common/Button';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Z_INDEX } from '@theme/zIndex';
import usePlatformSettings from '@hooks/usePlatformSettings';


export const MobileLandingPage: React.FC = () => {
  /*
   * Context
   */

  const {
    PaymentPlatform,
    setPaymentPlatform,
  } = usePlatformSettings();

  /*
   * Helpers
   */

  const handleResetPlatform = () => {
    setPaymentPlatform?.(PaymentPlatform.VENMO);
  };

  /*
   * Component
   */

  return (
    <Container>
      <Overlay onClick={() => {}} />

      <ModalContainer>
        <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
          Sorry!
        </ThemedText.HeadlineSmall>

        <ThemedText.SubHeader style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
          ZKP2P does not support Revolut on mobile. Please proceed on desktop to create or complete an order on Revolut.
        </ThemedText.SubHeader>

        <Button
          onClick={handleResetPlatform}
          fullWidth={true}
        >
          Go back
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
  z-index: ${Z_INDEX.overlay};
`;

const ModalContainer = styled.div`
  width: 65%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  background-color: ${colors.container};
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  position: absolute;
  top: 200px;
  z-index: ${Z_INDEX.mobile_landing_page};
`;
