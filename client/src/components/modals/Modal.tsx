import React, { useEffect, useMemo, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';

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
  setStatus,
  handleSubmitVerificationClick = () => {}
}) => {
  const navigate = useNavigate();

  /*
   * Context
   */

  const { isProvingTypeFast } = useProofGenSettings();

  /*
   * State
   */

  const [shouldShowProofAndSignals, setShouldShowProofAndSignals] = useState<boolean>(false);

  const [ctaButtonTitle, setCtaButtonTitle] = useState<string>("");

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
            return onBackClick();

          case CircuitType.EMAIL_VENMO_REGISTRATION:
          default:
            return navigate('/swap');
        }

      default:
        return handleSubmitVerificationClick();
    }
  };

  const getButtonDoneTitle = () => {
    switch (circuitType) {
      case CircuitType.EMAIL_VENMO_SEND:
        return 'Go Back'

      case CircuitType.EMAIL_VENMO_REGISTRATION:
      default:
        return 'Go to Swap'
    }
  };

  /*
   * Component
   */

  const renderVerificationSteps = () => {
    console.log('Status update: ', status);

    let downloadStepState = VerificationState.DEFAULT;
    let proveStepState = VerificationState.DEFAULT; 
    let verificationStepState = VerificationState.DEFAULT;
    let submitStepState = VerificationState.DEFAULT;
    
    switch (status) {
      case "not-started":
      case "generating-input":
      case "downloading-proof-files":
        downloadStepState = VerificationState.LOADING;
        break;

      case "generating-proof":
        downloadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.LOADING;
        break;

      case "verifying-proof":
        downloadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        verificationStepState = VerificationState.LOADING;
        break;

      case "transaction-configured":
        downloadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        verificationStepState = VerificationState.COMPLETE;
        break;

      case "transaction-mining":
        downloadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        verificationStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.LOADING;
        break;

      case "done":
        downloadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        verificationStepState = VerificationState.COMPLETE;
        submitStepState = VerificationState.COMPLETE;
        break;
    }

    const verificationStepRows = [];
    
    if (!isProvingTypeFast) {
      verificationStepRows.push(
        <VerificationStepRow
          key={0}
          type={VerificationStepType.DOWNLOAD}
          progress={downloadStepState}
          circuitType={circuitType}
        />
      );
    }

    verificationStepRows.push(
      <VerificationStepRow
        key={1}
        type={VerificationStepType.PROVE}
        progress={proveStepState}
        circuitType={circuitType}
      />
    );

    verificationStepRows.push(
      <VerificationStepRow
        key={2}
        type={VerificationStepType.VERIFY}
        progress={verificationStepState}
        circuitType={circuitType}
      />
    );

    verificationStepRows.push(
      <VerificationStepRow
        key={3}
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
