import React from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import QRCode from "react-qr-code";

import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '../../theme/text'


interface PaymentModalProps {
  link: string;
  onBackClick: () => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  link,
  onBackClick,
}) => {

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  };

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay onClick={handleOverlayClick}/>

      <ModalContainer>
        <RowBetween>
          <button
            onClick={handleOverlayClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: '1rem' }}
          >  
            <StyledArrowLeft/>
          </button>

          <ThemedText.HeadlineSmall style={{ margin: 'auto', textAlign: 'center' }}>
            Send Venmo Payment
          </ThemedText.HeadlineSmall>
        </RowBetween>

        <QRCode
          value={link}
          size={256}/>
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

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const ModalContainer = styled.div`
  width: 360px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 0.5rem 2.5rem 1rem;
  background: #0D111C;
  justify-content: space-between;
  color: #FFF;
  align-items: center;
  z-index: 20;
  gap: 1rem;
  top: 30%;
  position: relative;
`;

const RowBetween = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0rem 1.5rem 0rem;
  gap: 1.5rem;
`;
