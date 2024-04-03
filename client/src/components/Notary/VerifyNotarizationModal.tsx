import React, { useEffect, useMemo, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

import { Button } from "@components/common/Button";
import { LabeledSwitch } from "@components/common/LabeledSwitch";
import { Overlay } from '@components/modals/Overlay';
import { TitleCenteredRow } from '@components/layouts/Row';
import { LabeledTextArea } from '@components/legacy/LabeledTextArea';
import { VerificationStepRow, VerificationState, VerificationStepType } from "@components/Notary/VerificationStepRow";
import { commonStrings } from "@helpers/strings";
import { LoginStatus, NotaryVerificationStatus, NotaryVerificationCircuitType, NotaryVerificationCircuit } from  "@helpers/types";
import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import useAccount from '@hooks/useAccount';
import useSmartContracts from "@hooks/useSmartContracts";


interface VerifyNotarizationModalProps {
  title: string;
  verifierProof: string;
  publicSignals: string;
  onBackClick: () => void
  status: string;
  circuitType: NotaryVerificationCircuitType;
  buttonTitle: string;
  submitTransactionStatus: string;
  isSubmitMining: boolean;
  isSubmitSuccessful: boolean;
  handleSubmitVerificationClick?: () => void;
  setProofGenStatus?: (status: string) => void;
  onVerifyNotarizationCompletion?: () => void;
  transactionAddress?: string | null;
  verificationFailureErrorCode: number | null;
}

export const VerifyNotarizationModal: React.FC<VerifyNotarizationModalProps> = ({
  title,
  verifierProof,
  publicSignals,
  onBackClick,
  status,
  circuitType,
  buttonTitle,
  submitTransactionStatus,
  isSubmitMining,
  isSubmitSuccessful,
  transactionAddress,
  setProofGenStatus,
  handleSubmitVerificationClick = () => {},
  onVerifyNotarizationCompletion,
  verificationFailureErrorCode,
}) => {
  /*
   * Context
   */

  const { loginStatus } = useAccount();
  const size = useWindowSize();
  const { blockscanUrl } = useSmartContracts();

  /*
   * State
   */

  const [shouldShowProofAndSignals, setShouldShowProofAndSignals] = useState<boolean>(false);

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isSubmitProcessing, setIsSubmitProcessing] = useState<boolean>(false);

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
    if (setProofGenStatus) {
      switch (submitTransactionStatus) {
        case "error":
          setProofGenStatus(NotaryVerificationStatus.TRANSACTION_CONFIGURED);
          setIsSubmitProcessing(false);
          break;

        case "loading":
          setProofGenStatus(NotaryVerificationStatus.TRANSACTION_LOADING);
          setIsSubmitProcessing(true);
          break;

        default:
          setIsSubmitProcessing(false);
          break;
      }
    }
  }, [submitTransactionStatus, setProofGenStatus]);

  useEffect(() => {
    if (isSubmitMining && setProofGenStatus) {
      setProofGenStatus(NotaryVerificationStatus.TRANSACTION_MINING);
    }
  }, [isSubmitMining, setProofGenStatus]);

  useEffect(() => {
    if (isSubmitSuccessful && setProofGenStatus) {
      if (process.env.SHOW_CONFETTI === 'true') {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }
      setProofGenStatus(NotaryVerificationStatus.DONE);
    }
  }, [isSubmitSuccessful, setProofGenStatus])

  useEffect(() => {
    switch (status) {
      case NotaryVerificationStatus.TRANSACTION_CONFIGURED:
        setCtaButtonTitle(buttonTitle);
        break;

      case NotaryVerificationStatus.TRANSACTION_LOADING:
        setCtaButtonTitle("Signing Transaction");
        break;

      case NotaryVerificationStatus.TRANSACTION_MINING:
        setCtaButtonTitle("Mining Transaction");
        break;

      case NotaryVerificationStatus.ERROR_FAILED_TO_PROVE:
        switch (verificationFailureErrorCode) {
          case 1:
            setCtaButtonTitle("Validation Failed: Invalid Type");
            break;

          default:
            setCtaButtonTitle("Validation Failed: Try Again Shortly");
            break;
        }
        break;

      case NotaryVerificationStatus.DONE:
        switch (circuitType) {
          case NotaryVerificationCircuit.TRANSFER:
            setCtaButtonTitle('Go to Send');
            break;
    
          case NotaryVerificationCircuit.REGISTRATION_TAG:
            setCtaButtonTitle('Go to Registration');
            break;

          case NotaryVerificationCircuit.REGISTRATION_MULTICURRENCY_ID:
            setCtaButtonTitle('Go to Deposit');
            break;

          default:
            throw new Error(`Unknown circuit type: ${circuitType}`);
        };
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

  const isSubmitVerificationButtonLoading = (): boolean => {
    switch (status) {
      case "transaction-configured":
      case "done":
        return false;
        
      default:
        return loginStatus === LoginStatus.AUTHENTICATED;
    }
  };

  const getButtonHandler = () => {
    switch (status) {
      case "done":
        return onVerifyNotarizationCompletion?.();

      default:
        return handleSubmitVerificationClick();
    }
  };

  /*
   * Component
   */

  const renderVerificationSteps = () => {
    let uploadStepState = VerificationState.DEFAULT;
    let proveStepState = VerificationState.DEFAULT;
    let submitStepState = VerificationState.DEFAULT;

    switch (status) {
      case "not-started":
      case "generating-input":
        break;

      case "uploading-proof-files":
        uploadStepState = VerificationState.LOADING;
        break;

      case "generating-proof":
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.LOADING;
        break;

      case "error-failed-to-prove":
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.DEFAULT;
        break;

      case "transaction-configured":
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        break;

      case "transaction-loading":
      case "transaction-mining":
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.LOADING;
        break;

      case "done":
        uploadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.COMPLETE;
        break;
    }

    const verificationStepRows = [];

    verificationStepRows.push(
      <VerificationStepRow
        key={VerificationStepType.UPLOAD}
        type={VerificationStepType.UPLOAD}
        progress={uploadStepState}
        circuitType={circuitType}
      />
    );

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
      <Overlay />

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
            helperText={commonStrings.get('PROOF_TOOLTIP')}
            onSwitchChange={(checked: boolean) => setShouldShowProofAndSignals(checked)}/>
        </TitleCenteredRow>

        <VerificationStepsContainer>
          {renderVerificationSteps()}
        </VerificationStepsContainer>

        { shouldShowProofAndSignals && (
          <ProofAndSignalsContainer>
            <LabeledTextArea
              label="Proof Output"
              value={verifierProof}
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

        { transactionAddress?.length ? (
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
          loading={isSubmitVerificationButtonLoading()}
          disabled={isSubmitVerificationButtonDisabled || isSubmitProcessing}
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
  background-color: ${colors.container};
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  gap: 1.3rem;
  
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
