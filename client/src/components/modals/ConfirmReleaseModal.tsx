import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';

import { ThemedText } from '../../theme/text'
import { Overlay } from '@components/modals/Overlay';
import { commonStrings } from '@helpers/strings';
import { TransactionStatus, TransactionStatusType } from "@helpers/types";

import { Button } from "../Button";
import useSmartContracts from "@hooks/useSmartContracts";


interface ConfirmReleaseModalProps {
  onBackClick: () => void
}

export const ConfirmReleaseModal: React.FC<ConfirmReleaseModalProps> = ({
  onBackClick,
}) => {
  /*
   * Context
   */

  const { blockscanUrl } = useSmartContracts();

  /*
   * State
   */

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");

  const [transactionAddress, setTransactionAddress] = useState<string>("");

  const [submitTransactionStatus, setSubmitTransactionStatus] = useState<TransactionStatusType>(TransactionStatus.TRANSACTION_CONFIGURED);

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  }

  /*
   * Hooks
   */

  useEffect(() => {
    switch (submitTransactionStatus) {
      case TransactionStatus.TRANSACTION_CONFIGURED:
        setCtaButtonTitle("Submit Transaction");
        break;

      case TransactionStatus.TRANSACTION_LOADING:
        setCtaButtonTitle("Signing Transaction");
        break;

      case TransactionStatus.TRANSACTION_MINING:
        setCtaButtonTitle("Mining Transaction");
        break;

      case TransactionStatus.TRANSACTION_MINED:
          default:
            setCtaButtonTitle('Go to Deposits');
        break;
    }

  }, [submitTransactionStatus]);

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay />

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
            {'Release Funds'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <InstructionsContainer>
          <InstructionsLabel>
            { commonStrings.get('RELEASE_FUNDS_WARNING') }
          </InstructionsLabel>
        </InstructionsContainer>

        {transactionAddress?.length ? (
          <Link
            href={`${blockscanUrl}/tx/${transactionAddress}`}
            target="_blank"
            rel="noopener noreferrer">
              <ThemedText.LabelSmall textAlign="left" paddingBottom={"0.75rem"}>
                View on Explorer ↗
              </ThemedText.LabelSmall>
          </Link>
        ) : null}

        <Button
          disabled={false} // isSubmitVerificationButtonDisabled
          onClick={() => {}}
          fullWidth={true}
        >
          {ctaButtonTitle}
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
  gap: 1.5rem;
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

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
