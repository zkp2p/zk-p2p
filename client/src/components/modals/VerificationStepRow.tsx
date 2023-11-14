import React, { useEffect, useState } from "react";
import styled from 'styled-components/macro'
import { Download, Cpu, Check, Circle, Play, Upload } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';

import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import {
  PROOF_MODAL_DOWNLOAD_TITLE,
  PROOF_MODAL_DOWNLOAD_SUBTITLE,
  PROOF_MODAL_PROVE_TITLE,
  PROOF_MODAL_PROVE_SUBTITLE_PRIVATE,
  PROOF_MODAL_PROVE_SUBTITLE_FAST,
  PROOF_MODAL_SUBMIT_TITLE,
  PROOF_MODAL_SUBMIT_SUBTITLE,
  PROOF_MODAL_REGISTRATION_SUBMIT_TITLE,
  PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE,
  PROOF_MODAL_UPLOAD_SUBTITLE,
  PROOF_MODAL_UPLOAD_TITLE
} from "@helpers/tooltips"
import useProofGenSettings from "@hooks/useProofGenSettings"
import Spinner from "@components/common/Spinner";


export const VerificationStepType = {
  DOWNLOAD: "download",
  UPLOAD: "upload",
  PROVE: "prove",
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

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (progress === VerificationState.LOADING) {
      const interval = getUpdateIntervalMs(); // Milliseconds between each progress update
      const totalTime = getEstimatedTimesMs(); // Total time for the progress to go from 0 to 100
      const steps = totalTime / interval;
      const increment = 100 / steps;
      let timeout: NodeJS.Timeout;

      let currentPercentage = 0;

      const updatePercentage = () => {
        if (currentPercentage < 100) {
          setPercentage(currentPercentage);
          currentPercentage += Math.round(increment);
          timeout = setTimeout(updatePercentage, interval);
        } else {
          setPercentage(99);
        }
      };

      updatePercentage();

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  /*
   * Helpers
   */

  const getEstimatedTimesMs = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return 240000;
      case VerificationStepType.UPLOAD:
        return 1000;
      case VerificationStepType.PROVE:
        return isProvingTypeFast ? 120000 : 300000;
      default:
        return 0;
    }
  }

  const getUpdateIntervalMs = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return 1000;
      case VerificationStepType.UPLOAD:
        return 10;
      case VerificationStepType.PROVE:
        return 1000;
      default:
        return 0;
    }
  }

  const getLeftIcon = () => {
    switch (type) {
      case VerificationStepType.DOWNLOAD:
        return <StyledDownload progress={progress} />;
      case VerificationStepType.UPLOAD:
        return <StyledUpload progress={progress} />;
      case VerificationStepType.PROVE:
        return <StyledCpu progress={progress} />;
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
        return percentage < 99 && type !== VerificationStepType.SUBMIT ? (
          <CircularProgressbarWithChildren
            maxValue={99}
            styles={{
              root: {
                height: 33,
                width: 33,
              },
              text: {
                fontSize: 32,
                fill: '#4BB543',
              },
              path: {
                stroke: '#4BB543',
                transition: 'none',
              }
            }}
            value={percentage}
          >
            <Percentage>{`${percentage}`}</Percentage>
          </CircularProgressbarWithChildren>
        ) : (
          <Spinner size={36} />
        )

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

      case VerificationStepType.UPLOAD:
        return PROOF_MODAL_UPLOAD_TITLE;

      case VerificationStepType.PROVE:
        return PROOF_MODAL_PROVE_TITLE;

      case VerificationStepType.SUBMIT:
        switch (circuitType) {
          case CircuitType.EMAIL_VENMO_REGISTRATION:
            return PROOF_MODAL_REGISTRATION_SUBMIT_TITLE;

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

      case VerificationStepType.UPLOAD:
        return PROOF_MODAL_UPLOAD_SUBTITLE;

      case VerificationStepType.PROVE:
        if (isProvingTypeFast) {
          return PROOF_MODAL_PROVE_SUBTITLE_FAST;
        } else {
          return PROOF_MODAL_PROVE_SUBTITLE_PRIVATE;
        }

      case VerificationStepType.SUBMIT:
        switch (circuitType) {
          case CircuitType.EMAIL_VENMO_REGISTRATION:
            return PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE;

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
  width: 36px;
  height: 36px;
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#FFFFFF')};
`;

const Percentage = styled.div`
  font-size: 12px;
  color: #4BB543;
`

const StyledDownload = styled(IconBase).attrs({ as: Download })``;
const StyledCpu = styled(IconBase).attrs({ as: Cpu })``;
const StyledUpload = styled(IconBase).attrs({ as: Upload })``;
const StyledPlay = styled(IconBase).attrs({ as: Play })``;
const StyledCheck = styled(IconBase).attrs({ as: Check })`
  color: ${props => (props.progress === VerificationState.DEFAULT ? '#6C757D' : '#4BB543')};
`;
const StyledCircle = styled(IconBase).attrs({ as: Circle })``;
