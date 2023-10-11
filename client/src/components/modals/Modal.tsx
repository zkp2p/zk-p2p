import React, { useState } from "react";
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';

import { ThemedText } from '../../theme/text'
import { LabeledSwitch } from "../common/LabeledSwitch";
import { Overlay } from '@components/modals/Overlay'
import { TitleCenteredRow } from '@components/layouts/Row'
import { PROOF_TOOLTIP } from "@helpers/tooltips";
import useProofGenSettings from "@hooks/useProofGenSettings";

import { Button } from "../Button";
import { VerificationStepRow, VerificationState, VerificationStepType } from "./VerificationStepRow";
import { LabeledTextArea } from '../legacy/LabeledTextArea';


export interface VerificationStepRowConfiguration {
  stepType: string;
  stepState: string;
}

interface ModalProps {
  title: string;
  onBackClick: () => void;
  modalType: string;
  verificationSteps: VerificationStepRowConfiguration[];
  handleSubmitVerificationClick?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  onBackClick,
  verificationSteps,
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
   * Component
   */

  const renderVerificationSteps = () => {
    if (isProvingTypeFast) {
      const filteredSteps = verificationSteps.filter(step => step.stepType !== VerificationStepType.DOWNLOAD);
      return filteredSteps.map((step, index) => (
        <VerificationStepRow
          key={index}
          stepType={step.stepType}
          stepState={step.stepState}
        />
      ));
    } else {
      return verificationSteps.map((step, index) => (
        <VerificationStepRow
          key={index}
          stepType={step.stepType}
          stepState={step.stepState}
        />
      ));
    }
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
              value={""}
              disabled={true}
              height={"8vh"} />

            <LabeledTextArea
              label="Public Signals"
              value={""}
              disabled={true}
              height={"8vh"}
              secret />
          </ProofAndSignalsContainer>
          )
        }

        <Button
          disabled={true}
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
  top: 20%;
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
