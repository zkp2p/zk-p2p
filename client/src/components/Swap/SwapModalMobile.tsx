import React from 'react';
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';

import { Button } from '@components/common/Button';
import { Overlay } from '@components/modals/Overlay';
import { PaymentRequirementDrawer } from '@components/Swap/PaymentRequirementDrawer';
import { InstructionTitle } from '@components/Swap/SwapInstructionTitle';
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import usePlatformSettings from '@hooks/usePlatformSettings';
import { PaymentPlatformType } from '@helpers/types';


interface SwapModalMobileProps {
  isVenmo: boolean;
  venmoId: string;
  link: string;
  depositorName?: string;
  amount: string;
  onBackClick: () => void
  onCompleteClick: () => void
  paymentPlatform: PaymentPlatformType;
}

export const SwapModalMobile: React.FC<SwapModalMobileProps> = ({
  isVenmo,
  venmoId,
  depositorName,
  link,
  amount,
  onBackClick,
  onCompleteClick,
  paymentPlatform,
}) => {

  /*
   * Context
   */

  const {
    PaymentPlatform,
  } = usePlatformSettings();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  };

  const handleCompleteClick = () => {
    onCompleteClick();
  };

  /*
   * Helpers
   */

  function getPlatformVariables(paymentPlatform: PaymentPlatformType | undefined, amount: string, venmoId: string) {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        return {
          paymentPlatformName: 'Venmo',
          instructionsText: `Send $${amount} to the matched peer in the Venmo app`,
        };

      case PaymentPlatform.HDFC:
        return {
          paymentPlatformName: 'HDFC',
          instructionsText: `Send ₹${amount} to ${venmoId}`,
        };

      case PaymentPlatform.GARANTI:
        return {
          paymentPlatformName: 'Garanti',
          instructionsText: `Using your Garanti app, send ₺${amount} to the IBAN account number and name below`,
        };

      default:
        return {
          paymentPlatformName: 'Venmo',
          instructionsText: `Send $${amount} to ${venmoId}`,
        };
    }
  };

  const {
    paymentPlatformName,
    instructionsText
  } = getPlatformVariables(paymentPlatform, amount, venmoId);

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay onClick={handleOverlayClick}/>

      <ModalContainer $isVenmo={isVenmo}>
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
            Complete Order
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </RowBetween>

        <StepContainer>
          <InstructionTitle
            number={1}
            title={`Make Payment`}
            description={instructionsText}
          />

          {paymentPlatform !== PaymentPlatform.GARANTI ? (
            <ButtonContainer>
              <Button
                height={44}
                fontSize={15}
                onClick={() => {
                  window.open(link, '_blank', 'noopener,noreferrer');
                }}
              >
                {`Open ${paymentPlatformName}`}
              </Button> 
            </ButtonContainer>
          ) : (
            <GarantiInformationContainer>
              <IBANTitle
                dangerouslySetInnerHTML={{ __html: `${venmoId}`}}
              />

              <IBANTitle
                dangerouslySetInnerHTML={{ __html: `${depositorName ? depositorName : ''}`}}
              />
            </GarantiInformationContainer>
          )}
        </StepContainer>

        <StepContainer>
          <InstructionTitle
            number={2}
            title={'Process Payment Receipt'}
            description={'Verify payment with email to complete order and receive USDC'}
          />
          <ButtonContainer>
            <Button
              height={44}
              fontSize={15}
              onClick={async () => {
                handleCompleteClick();
              }}
              bgColor={ '#df2e2d' }
            >
              Process payment
            </Button>
          </ButtonContainer>
        </StepContainer>

        <InstructionsContainer>
          <PaymentRequirementDrawer
            paymentPlatform={paymentPlatform}
          />
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

const ModalContainer = styled.div<{$isVenmo?: boolean}>`
  width: 80vw;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 1rem;
  background-color: ${colors.container};
  justify-content: space-between;
  color: #FFF;
  align-items: center;
  z-index: 20;
  gap: 2rem;
  overflow-y: auto;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const InstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

const IBANTitle = styled.div`
  line-height: 1.3;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
`;

const RowBetween = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
`;

const StepContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
`;

const ButtonContainer = styled.div`
  display: grid;
  padding: 0 3.75rem;
`;

const GarantiInformationContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 0.5rem;
  gap: 1rem;
`;
