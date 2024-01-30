import React from 'react';
import styled from 'styled-components/macro';
import { X, Unlock } from 'react-feather';

import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'
import useModal from '@hooks/useModal';


export default function WithdrawModal() {
  /*
   * Contexts
   */

  const { closeModal } = useModal();

  /*
   * Handlers
   */

  const handleCloseModal = () => {
    closeModal();
  };

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay onClick={handleCloseModal} />

      <ModalContainer>
        <TitleCenteredRow>
          <div style={{ flex: 0.25 }}>
            <button
              onClick={handleCloseModal}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >

              <StyledX/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            {'Withdraw'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <StyledUnlock />

        <InstructionsContainer>
          <InstructionsLabel>
            { `1000 USDC` }
          </InstructionsLabel>
        </InstructionsContainer>
      </ModalContainer>
    </ModalAndOverlayContainer>
  );
}

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
  background: #0D111C;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
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

const StyledX = styled(X)`
  color: #FFF;
`;

const StyledUnlock = styled(Unlock)`
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
