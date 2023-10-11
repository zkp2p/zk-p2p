import React from "react";
import styled from 'styled-components/macro'
import { Download, Cpu, Shield, Check, Circle } from 'react-feather';

import Spinner from "@components/common/Spinner";


export const VerificationStepType = {
  DOWNLOAD: "download",
  PROVE: "prove",
  VERIFY: "verify",
};

export const VerificationTitles = {
  DOWNLOAD: "Downloading Verification Tools",
  PROVE: "Verifying Email Contents",
  VERIFY: "Finalizing Verification",
};

export const VerificationState = {
  DEFAULT: 'default',
  LOADING: 'loading',
  COMPLETE: 'complete',
};

interface VerificationStepRowProps {
  stepType: string;
  stepState: string;
}

export type VerificationStepRowData = VerificationStepRowProps;

export const VerificationStepRow: React.FC<VerificationStepRowProps> = ({
  stepType,
  stepState
}: VerificationStepRowProps) => {
  VerificationStepRow.displayName = "VerificationStepRow";

  /*
   * Helpers
   */

  const getLeftIcon = () => {
    switch (stepType) {
      case VerificationStepType.DOWNLOAD:
        return <StyledDownload stepState={stepState} />;
      case VerificationStepType.PROVE:
        return <StyledCpu stepState={stepState} />;
      case VerificationStepType.VERIFY:
        return <StyledShield stepState={stepState} />;
      default:
        return null;
    }
  };

  const getRightIcon = () => {
    switch (stepState) {
      case VerificationState.DEFAULT:
        return <StyledCircle stepState={stepState} />;
      case VerificationState.LOADING:
        return <Spinner />;
      case VerificationState.COMPLETE:
        return <StyledCheck stepState={stepState} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (stepType) {
      case VerificationStepType.DOWNLOAD:
        return VerificationTitles.DOWNLOAD;
      case VerificationStepType.PROVE:
        return VerificationTitles.PROVE;
      case VerificationStepType.VERIFY:
        return VerificationTitles.VERIFY;
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

      <Label stepState={stepState}>
        {getTitle()}&nbsp;.&nbsp;.&nbsp;.
      </Label>

      <ActionsContainer>
        {getRightIcon()}
      </ActionsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 1rem;
  gap: 1.25rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
`;

const Label = styled.span<{ stepState: string }>`
  color: ${props => (props.stepState === VerificationState.DEFAULT ? '#6C757D' : '#FFFFFF')};
  font-size: 17px;
`;

const IconBase = styled.div<{ stepState: string }>`
  width: 24px;
  height: 24px;
  color: ${props => (props.stepState === VerificationState.DEFAULT ? '#6C757D' : '#FFFFFF')};
`;

const StyledDownload = styled(IconBase).attrs({ as: Download })``;
const StyledCpu = styled(IconBase).attrs({ as: Cpu })``;
const StyledShield = styled(IconBase).attrs({ as: Shield })``;
const StyledCheck = styled(IconBase).attrs({ as: Check })`
  color: ${props => (props.stepState === VerificationState.DEFAULT ? '#6C757D' : '#4BB543')};
`;
const StyledCircle = styled(IconBase).attrs({ as: Circle })``;
