import React, { useContext, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';
import { CircuitType } from '@zkp2p/circuits-circom/scripts/generate_input';

import { TitleCenteredRow } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { ProofGenerationForm } from "../common/ProofGenerationForm";
import { SubmitRegistration } from "./SubmitRegistration";
import { LabeledSwitch } from "../common/LabeledSwitch";
import { REGISTRATION_KEY_FILE_NAME } from "../../helpers/constants";
import { PROVING_TYPE_TOOLTIP } from "../../helpers/tooltips";

import ProofGenSettingsContext from '../../contexts/ProofGenSettings/ProofGenSettingsContext';


interface NewRegistrationProps {
  handleBackClick: () => void;
}
 
export const NewRegistration: React.FC<NewRegistrationProps> = ({
  handleBackClick
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
          Update Registration
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
          circuitType={CircuitType.EMAIL_VENMO_REGISTRATION}
          circuitRemoteFilePath={REGISTRATION_KEY_FILE_NAME}
          circuitInputs={"1"} // Arbitrary value, unused for registration
          setProof={setProof}
          setPublicSignals={setPublicSignals}
        />

        {!isProvingTypeFast && (
          <SubmitRegistration
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
