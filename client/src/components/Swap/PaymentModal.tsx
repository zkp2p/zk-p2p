import React from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import QRCode from "react-qr-code";

import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '../../theme/text'


interface PaymentModalProps {
  link: string;
  amount: string;
  onBackClick: () => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  link,
  amount,
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
          <div style={{ flex: 0.25 }}>
            <button
              onClick={handleOverlayClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <StyledArrowLeft/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            Send Venmo Payment
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </RowBetween>

        <QRContainer>
          <QRCode
            value={link}
            size={196}/>
        </QRContainer>

        <InstructionsContainer>
          <InstructionsTitle>
            Scan and send ${amount}
          </InstructionsTitle>

          <InstructionsLabel>
            You must send greater than or equal to the send amount in one transaction or funds may be lost.
            Payment receipt emails are required to complete the order.
          </InstructionsLabel>
        </InstructionsContainer>
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
  width: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 1rem;
  background: #0D111C;
  justify-content: space-between;
  color: #FFF;
  align-items: center;
  z-index: 20;
  gap: 1.5rem;
  top: 24%;
  position: relative;
`;

const QRContainer = styled.div`
  padding: 2rem;
  border: 1.5px solid #98a1c03d;
  border-radius: 16px;
  background: #131A2A;
`;

const InstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 0 1.75rem;
`;

const InstructionsTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  text-align: center;
`;

const InstructionsLabel = styled.div`
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
`;

const RowBetween = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
`;
