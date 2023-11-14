import React, { useEffect, useMemo, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

import { ThemedText } from '../../theme/text'
import { LabeledSwitch } from "../common/LabeledSwitch";
import { Overlay } from '@components/modals/Overlay';
import { TitleCenteredRow } from '@components/layouts/Row';
import { PROOF_TOOLTIP } from "@helpers/tooltips";
import useProofGenSettings from "@hooks/useProofGenSettings";
import { ProofGenerationStatus } from  "../ProofGen/types";

import { Button } from "../Button";
import { VerificationStepRow, VerificationState, VerificationStepType } from "./VerificationStepRow";
import { LabeledTextArea } from '../legacy/LabeledTextArea';
import useSmartContracts from "@hooks/useSmartContracts";


interface ModalProps {
  title: string;
  proof: string;
  publicSignals: string;
  onBackClick: () => void
  status: ProofGenerationStatus;
  circuitType: CircuitType;
  buttonTitle: string;
  isSubmitProcessing: boolean;
  isSubmitSuccessful: boolean;
  handleSubmitVerificationClick?: () => void;
  setStatus?: (status: ProofGenerationStatus) => void;
  onVerifyEmailCompletion?: () => void;
  transactionAddress?: string | null;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  proof,
  publicSignals,
  onBackClick,
  status,
  circuitType,
  buttonTitle,
  isSubmitProcessing,
  isSubmitSuccessful,
  transactionAddress,
  setStatus,
  handleSubmitVerificationClick = () => {},
  onVerifyEmailCompletion,
}) => {
  /*
   * Context
   */

  const { isProvingTypeFast } = useProofGenSettings();
  const size = useWindowSize();
  const { blockscanUrl } = useSmartContracts();

  /*
   * State
   */

  const [shouldShowProofAndSignals, setShouldShowProofAndSignals] = useState<boolean>(false);

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

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
    if (isSubmitProcessing && setStatus) {
      setStatus("transaction-mining");
    }
  }, [isSubmitProcessing, setStatus]);

  useEffect(() => {
    if (isSubmitSuccessful && setStatus) {
      if (process.env.SHOW_CONFETTI === 'true') {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }
      setStatus("done");
    }
  }, [isSubmitSuccessful, setStatus])

  useEffect(() => {
    switch (status) {
      case "transaction-configured":
        setCtaButtonTitle(buttonTitle);
        break;

      case "done":
        const buttonDoneTitle = getButtonDoneTitle();

        setCtaButtonTitle(buttonDoneTitle);
        break;

      default:
        setCtaButtonTitle(buttonTitle);
        break;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, buttonTitle]);

  /*
   * Helpers
   */

  const isSubmitVerificationButtonDisabled = useMemo(() => {
    switch (status) {
      case "transaction-configured":
      case "done":
        return false;

      default:
        return true;
    }
  }, [status]);

  const getButtonHandler = () => {
    switch (status) {
      case "done":
        switch (circuitType) {
          case CircuitType.EMAIL_VENMO_SEND:
            return onVerifyEmailCompletion?.();

          case CircuitType.EMAIL_VENMO_REGISTRATION:
          default:
            return onVerifyEmailCompletion?.();
        }

      default:
        return handleSubmitVerificationClick();
    }
  };

  const getButtonDoneTitle = () => {
    switch (circuitType) {
      case CircuitType.EMAIL_VENMO_SEND:
        return 'Go to Swap'

      case CircuitType.EMAIL_VENMO_REGISTRATION:
      default:
        return 'Go to Registration'
    }
  };

  /*
   * Component
   */

  const renderVerificationSteps = () => {
    console.log('Status update: ', status);

    let downloadStepState = VerificationState.DEFAULT;
    let uploadStepState = VerificationState.DEFAULT;
    let proveStepState = VerificationState.DEFAULT;
    let submitStepState = VerificationState.DEFAULT;

    switch (status) {
      case "not-started":
      case "generating-input":
      case "downloading-proof-files":
        downloadStepState = VerificationState.LOADING;
        break;

      case "uploading-proof-files":
        downloadStepState = VerificationState.COMPLETE;
        uploadStepState = VerificationState.LOADING;
        break;

      case "generating-proof":
        downloadStepState = VerificationState.COMPLETE;
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.LOADING;
        break;

      case "transaction-configured":
        downloadStepState = VerificationState.COMPLETE;
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        break;

      case "transaction-mining":
        downloadStepState = VerificationState.COMPLETE;
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.LOADING;
        break;

      case "done":
        downloadStepState = VerificationState.COMPLETE;
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.COMPLETE;
        break;
    }

    const verificationStepRows = [];

    if (!isProvingTypeFast) {
      verificationStepRows.push(
        <VerificationStepRow
          key={VerificationStepType.DOWNLOAD}
          type={VerificationStepType.DOWNLOAD}
          progress={downloadStepState}
          circuitType={circuitType}
        />
      );
    }

    if (isProvingTypeFast) {
      verificationStepRows.push(
        <VerificationStepRow
          key={VerificationStepType.UPLOAD}
          type={VerificationStepType.UPLOAD}
          progress={uploadStepState}
          circuitType={circuitType}
        />
      );
    }

    verificationStepRows.push(
      <VerificationStepRow
        key={VerificationStepType.PROVE}
        type={VerificationStepType.PROVE}
        progress={proveStepState}
        circuitType={circuitType}
      />
    );

    verificationStepRows.push(
      <VerificationStepRow
        key={VerificationStepType.SUBMIT}
        type={VerificationStepType.SUBMIT}
        progress={submitStepState}
        circuitType={circuitType}
      />
    );

    return verificationStepRows;
  };

  return (
    <ModalAndOverlayContainer>
      <Overlay onClick={handleOverlayClick}/>

      {showConfetti ? (
        <ConfettiContainer>
          <Confetti
            recycle={false}
            numberOfPieces={500}
            width={size.width ?? undefined}
            height={document.documentElement.scrollHeight}
          />
        </ConfettiContainer>
      ) : null}
      <ModalContainer>
        <TitleCenteredRow>
          <button
            onClick={handleOverlayClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >

            <StyledArrowLeft/>
          </button>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            {title}
          </ThemedText.HeadlineSmall>

          <LabeledSwitch
            switchChecked={shouldShowProofAndSignals}
            checkedLabel={"Hide"}
            uncheckedLabel={"Show"}
            helperText={PROOF_TOOLTIP}
            onSwitchChange={(checked: boolean) => setShouldShowProofAndSignals(checked)}/>
        </TitleCenteredRow>

        <VerificationStepsContainer>
          {renderVerificationSteps()}
        </VerificationStepsContainer>

        { shouldShowProofAndSignals && (
          <ProofAndSignalsContainer>
            <LabeledTextArea
              label="Proof Output"
              value={proof}
              disabled={true}
              height={"12vh"} />

            <LabeledTextArea
              label="Public Signals"
              value={publicSignals}
              disabled={true}
              height={"12vh"}
              secret />
          </ProofAndSignalsContainer>
          )
        }

        {transactionAddress?.length ? (
          <Link
            href={`${blockscanUrl}/tx/${transactionAddress}`}
            target="_blank"
            rel="noopener noreferrer">
              <ThemedText.LabelSmall textAlign="left">
                View on Etherscan ↗
              </ThemedText.LabelSmall>
          </Link>
        ) : null}

        <Button
          disabled={isSubmitVerificationButtonDisabled || isSubmitProcessing}
          loading={isSubmitProcessing}
          onClick={getButtonHandler}
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
  gap: 1.3rem;
  top: 22%;
  position: relative;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const VerificationStepsContainer = styled.div`
  width: 100%;
`;

const ProofAndSignalsContainer = styled.div`
  width: 100%;
  background: #eeeee;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

const ConfettiContainer = styled.div`
  z-index: 20;
`;
