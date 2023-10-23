import React from "react";
import styled from 'styled-components/macro'
import { Download, Cpu, Check, Circle, Shield, Play } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';

import Spinner from "@components/common/Spinner";
import {
  PROOF_MODAL_DOWNLOAD_TITLE,
  PROOF_MODAL_DOWNLOAD_SUBTITLE,
  PROOF_MODAL_PROVE_TITLE,
  PROOF_MODAL_PROVE_SUBTITLE_PRIVATE,
  PROOF_MODAL_PROVE_SUBTITLE_FAST,
  PROOF_MODAL_VERIFY_TITLE,
  PROOF_MODAL_VERIFY_SUBTITLE,
  PROOF_MODAL_SUBMIT_TITLE,
  PROOF_MODAL_SUBMIT_SUBTITLE,
  PROOF_MODAL_REGISTRATION_SUBMIT_TITLE,
  PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE
} from "@helpers/tooltips"
import useProofGenSettings from "@hooks/useProofGenSettings"


export const VerificationStepType = {
  DOWNLOAD: "download",
  PROVE: "prove",
  VERIFY: "verify",
  SUBMIT: "submit",
};

export const VerificationState = {
  DEFAULT: 'default',
  LOADING: 'loading',
  COMPLETE: 'complete',
};

interface VerificationStepRowProps {
  type: string;
  progress: string;
  circuitType: CircuitType;
}

export type VerificationStepRowData = VerificationStepRowProps;

export const VerificationStepRow: React.FC<VerificationStepRowProps> = ({
  type,
  progress,
  circuitType
}: VerificationStepRowProps) => {
  VerificationStepRow.displayName = "VerificationStepRow";

  /*
   * Context
   */

  const { isProvingTypeFast } = useProofGenSettings();

  /*
   * Helpers
   */

  const getLeftIcon = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return <StyledDownload progress={progress} />;
      case VerificationStepType.PROVE:
        return <StyledCpu progress={progress} />;
      case VerificationStepType.VERIFY:
        return <StyledShield progress={progress} />;
      case VerificationStepType.SUBMIT:
        return <StyledPlay progress={progress} />;
      default:
        return null;
    }
  };

  const getRightIcon = () => {
    switch (progress) {
      case VerificationState.DEFAULT:
        return <StyledCircle progress={progress} />;

      case VerificationState.LOADING:
        return <Spinner />;

      case VerificationState.COMPLETE:
        return <StyledCheck progress={progress} />;
        
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return PROOF_MODAL_DOWNLOAD_TITLE;

      case VerificationStepType.PROVE:
        return PROOF_MODAL_PROVE_TITLE;

      case VerificationStepType.VERIFY:
        return PROOF_MODAL_VERIFY_TITLE;

      case VerificationStepType.SUBMIT:
        switch (circuitType) {
          case CircuitType.EMAIL_VENMO_REGISTRATION:
            return PROOF_MODAL_REGISTRATION_SUBMIT_TITLE;

          case CircuitType.EMAIL_VENMO_RECEIVE:
          case CircuitType.EMAIL_VENMO_SEND:
          default:
            return PROOF_MODAL_SUBMIT_TITLE;
        }

      default:
        return null;
    }
  }

  const getSubTitle = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return PROOF_MODAL_DOWNLOAD_SUBTITLE;

      case VerificationStepType.PROVE:
        if (isProvingTypeFast) {
          return PROOF_MODAL_PROVE_SUBTITLE_FAST;
        } else {
          return PROOF_MODAL_PROVE_SUBTITLE_PRIVATE;
        }

      case VerificationStepType.VERIFY:
        return PROOF_MODAL_VERIFY_SUBTITLE;

      case VerificationStepType.SUBMIT:
        switch (circuitType) {
          case CircuitType.EMAIL_VENMO_REGISTRATION:
            return PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE;

          case CircuitType.EMAIL_VENMO_RECEIVE:
          case CircuitType.EMAIL_VENMO_SEND:
          default:
            return PROOF_MODAL_SUBMIT_SUBTITLE;
        }
        
      default:
        return null;
    }
  }

  /*
   * Component
   */

  return (
    <Container>
      {getLeftIcon()}

      <TitleAndSubtitleContainer>
        <Label progress={progress}>
          {getTitle()}
        </Label>

        <Subtitle progress={progress}>
          {getSubTitle()}
        </Subtitle>
      </TitleAndSubtitleContainer>

      <ActionsContainer>
        {getRightIcon()}
      </ActionsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;
  gap: 1.25rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
`;

const TitleAndSubtitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  gap: 4px;
`;

const Label = styled.span<{ progress: string }>`
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#FFFFFF')};
  font-size: 16px;
`;

const Subtitle = styled.span<{ progress: string }>`
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#ADB5BD')};
  font-size: 12px;
`;

const IconBase = styled.div<{ progress: string }>`
  width: 24px;
  height: 24px;
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#FFFFFF')};
`;

const StyledDownload = styled(IconBase).attrs({ as: Download })``;
const StyledCpu = styled(IconBase).attrs({ as: Cpu })``;
const StyledShield = styled(IconBase).attrs({ as: Shield })``;
const StyledPlay = styled(IconBase).attrs({ as: Play })``;
const StyledCheck = styled(IconBase).attrs({ as: Check })`
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#4BB543')};
`;
const StyledCircle = styled(IconBase).attrs({ as: Circle })``;
