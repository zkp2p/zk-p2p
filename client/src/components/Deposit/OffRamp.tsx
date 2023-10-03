import React, { useContext, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';

import { TitleCenteredRow } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { ProofGenerationForm } from "../common/ProofGenerationForm";
import { SubmitOffRamp } from "./SubmitOffRamp";
import { LabeledSwitch } from "../common/LabeledSwitch";
import { RECEIVE_KEY_FILE_NAME } from "@helpers/constants";
import { PROVING_TYPE_TOOLTIP } from "@helpers/tooltips";


// TODO: use hook
import ProofGenSettingsContext from '../../contexts/ProofGenSettings/ProofGenSettingsContext';


interface OffRampProps {
  handleBackClick: () => void;
  selectedIntentHash: string;
}
 
export const OffRamp: React.FC<OffRampProps> = ({
  handleBackClick,
  selectedIntentHash
}) => {
  /*
   * Context
   */
  const {
    isProvingTypeFast,
    setIsProvingTypeFast,
  } = useContext(ProofGenSettingsContext);

  // ----- transaction state -----
  const [proof, setProof] = useState<string>('');
  // const [proof, setProof] = useState<string>(
  //   JSON.stringify()
  // );
  
  const [publicSignals, setPublicSignals] = useState<string>('');
  // const [publicSignals, setPublicSignals] = useState<string>(
  //   JSON.stringify()
  // );

  /*
   * Handlers
   */
  const handleProvingTypeChanged = (checked: boolean) => {
    if (setIsProvingTypeFast) {
      setIsProvingTypeFast(checked);
    }
  };

  /*
    Component
  */
  return (
    <Container>
      <TitleCenteredRow style={{ paddingBottom: '1.5rem' }}>
        <button
          onClick={handleBackClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <StyledArrowLeft/>
        </button>

        <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
          Complete Off-Ramp
        </ThemedText.HeadlineSmall>

        <LabeledSwitch
          switchChecked={isProvingTypeFast ?? true}
          onSwitchChange={handleProvingTypeChanged}
          checkedLabel={"Speed"}
          uncheckedLabel={"Privacy"}
          helperText={PROVING_TYPE_TOOLTIP}
        />
      </TitleCenteredRow>

      <Body>
        <ProofGenerationForm
          circuitType={CircuitType.EMAIL_VENMO_RECEIVE}
          circuitRemoteFilePath={RECEIVE_KEY_FILE_NAME}
          circuitInputs={selectedIntentHash}
          setProof={setProof}
          setPublicSignals={setPublicSignals}
        />

        {!isProvingTypeFast && (
          <SubmitOffRamp
            proof={proof}
            publicSignals={publicSignals}
          />
        )}
      </Body>
    </Container>
  );
};

const Container = styled.div`
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-self: flex-start;
  justify-content: center;
`;
