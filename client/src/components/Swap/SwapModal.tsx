import React from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import QRCode from "react-qr-code";
import Link from '@mui/material/Link';

import { Button } from "@components/common/Button";
import { Overlay } from '@components/modals/Overlay';
import { commonStrings } from '@helpers/strings';
import { PaymentRequirementDrawer } from "@components/Swap/PaymentRequirementDrawer";
import { PaymentPlatformType } from '@helpers/types';
import { ThemedText } from '@theme/text';
import usePlatformSettings from "@hooks/usePlatformSettings";
import { ZKP2P_TG_INDIA_CHAT_LINK, ZKP2P_TG_TURKEY_CHAT_LINK } from "@helpers/docUrls";


interface SwapModalProps {
  isVenmo: boolean;
  venmoId: string;
  link: string;
  amount: string;
  onBackClick: () => void
  onCompleteClick: () => void
  paymentPlatform: PaymentPlatformType
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isVenmo,
  venmoId,
  link,
  amount,
  onBackClick,
  onCompleteClick,
  paymentPlatform
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

  function getPlatformVariables(paymentPlatform: PaymentPlatformType | undefined) {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        return {
          troubleScanningQRCodeLink: link,
          paymentPlatformName: 'Venmo',
          instructionsText: `Scan and send $${amount}`,
        };
      case PaymentPlatform.HDFC:
        return {
          troubleScanningQRCodeLink: ZKP2P_TG_INDIA_CHAT_LINK,
          currencySymbol: '₹',
          paymentPlatformName: 'HDFC',
          instructionsText: `Scan and send ₹${amount} <br />to ${venmoId}`,
        };
      case PaymentPlatform.GARANTI:
        return {
          troubleScanningQRCodeLink: ZKP2P_TG_TURKEY_CHAT_LINK,
          paymentPlatformName: 'Garanti',
          instructionsText: `Using your Garanti app, send ₺${amount} <br />to the above IBAN account number`,
        };
      default:
        return {
          troubleScanningQRCodeLink: link,
          paymentPlatformName: 'Venmo',
          instructionsText: `Scan and send $${amount}`,
        };
    }
  }

  const {
    paymentPlatformName,
    troubleScanningQRCodeLink,
    instructionsText
  } = getPlatformVariables(paymentPlatform);

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
            Send {paymentPlatformName} Payment
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </RowBetween>
        {paymentPlatform != PaymentPlatform.GARANTI ? (
          <div>
            <QRContainer>
              <QRCode
                value={link}
                size={192}/>
            </QRContainer>
            <QRLabel>
              <Link href={troubleScanningQRCodeLink} target="_blank">  
                Trouble scanning QR?
              </Link>
            </QRLabel>     
          </div>
        ) : (
          <IBANTitle
            dangerouslySetInnerHTML={{ __html: venmoId }}
          />
        )}

        <InstructionsContainer>
          <InstructionsTitle
            dangerouslySetInnerHTML={{ __html: instructionsText }}
          />

          <InstructionsLabel>
            { commonStrings.get('PAY_MODAL_INSTRUCTIONS') }
            <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/on-ramping" target="_blank">
              Learn more ↗
            </Link>
          </InstructionsLabel>
        </InstructionsContainer>

        <PaymentRequirementDrawer
          paymentPlatform={paymentPlatform}
        />

        <ButtonContainer>
          <Button
            onClick={async () => {
              handleCompleteClick();
            }}
          >
            I have completed payment
          </Button>
        </ButtonContainer>
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
  height: ${({ $isVenmo }) => $isVenmo ? '588px' : '612px'};
  overflow-y: auto;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const QRContainer = styled.div`
  padding: 1.25rem 1.25rem 1rem 1.25rem;
  border: 1px solid #98a1c03d;
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

const IBANTitle = styled.div`
  line-height: 1.5;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
`;

const InstructionsTitle = styled.div`
  line-height: 1.3;
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

const ButtonContainer = styled.div`
  display: grid;
`;

const QRLabel = styled.div`
  font-size: 14px;
  text-align: center;
  margin-top: -1rem;
  line-height: 1.5;
`;
