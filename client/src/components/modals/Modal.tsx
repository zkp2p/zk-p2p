import React, { useMemo, useState } from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';

import { ThemedText } from '../../theme/text'
import { LabeledSwitch } from "../common/LabeledSwitch";
import { Overlay } from '@components/modals/Overlay'
import { TitleCenteredRow } from '@components/layouts/Row'
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
  handleSubmitVerificationClick?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  proof,
  publicSignals,
  onBackClick,
  status,
  handleSubmitVerificationClick = () => {}
}) => {
  /*
   * Context
   */

  const { isProvingTypeFast } = useProofGenSettings();

  /*
   * State
   */

  const [shouldShowProofAndSignals, setShouldShowProofAndSignals] = useState<boolean>(false);

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  }

  /*
   * Helpers
   */

  const isSubmitVerificationButtonDisabled = useMemo(() => {
    return status !== "done";
  }, [status]);

  /*
   * Component
   */

  const renderVerificationSteps = () => {
    console.log('Status update: ', status);

    let downloadStepState = VerificationState.DEFAULT;
    let proveStepState = VerificationState.DEFAULT; 
    let verificationStepState = VerificationState.DEFAULT;
    
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

      case "done":
        downloadStepState = VerificationState.COMPLETE;
        proveStepState = VerificationState.COMPLETE;
        verificationStepState = VerificationState.COMPLETE;
        break;
    }

    const verificationStepRows = [];
    
    if (!isProvingTypeFast) {
      verificationStepRows.push(
        <VerificationStepRow
          stepType={VerificationStepType.DOWNLOAD}
          stepState={downloadStepState}
        />
      );
    }

    verificationStepRows.push(
      <VerificationStepRow
        stepType={VerificationStepType.PROVE}
        stepState={proveStepState}
      />
    );

    verificationStepRows.push(
      <VerificationStepRow
        stepType={VerificationStepType.VERIFY}
        stepState={verificationStepState}
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
            checkedLabel={"Show"}
            uncheckedLabel={"Hide"}
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
          disabled={isSubmitVerificationButtonDisabled}
          loading={false}
          onClick={handleSubmitVerificationClick}
          fullWidth={true}
        >
          Complete Ramp
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
  width: 480px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0D111C;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  gap: 2rem;
  top: 25%;
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
  gap: 1rem;
`;
