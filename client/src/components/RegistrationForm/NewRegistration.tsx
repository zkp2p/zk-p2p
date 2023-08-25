import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro'
import { ArrowLeft } from 'react-feather';

import { TitleCenteredRow } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { NewRegistrationProof } from "./NewRegistrationProof";
import { NewRegistrationSubmit } from "./NewRegistrationSubmit";
import { LabeledSwitch } from "../common/LabeledSwitch";

import ProofGenSettingsContext from '../../contexts/ProofGenSettings/ProofGenSettingsContext';

import {
  PROVING_TYPE_TOOLTIP
} from "../../helpers/tooltips";


interface NewRegistrationProps {
  loggedInWalletAddress: string;
  handleBackClick: () => void;
}
 
export const NewRegistration: React.FC<NewRegistrationProps> = ({
  loggedInWalletAddress,
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
  const [submitOrderPublicSignals, setSubmitOrderPublicSignals] = useState<string>('');
  const [submitOrderProof, setSubmitOrderProof] = useState<string>('');

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
        <NewRegistrationProof
          loggedInWalletAddress={loggedInWalletAddress}
          setSubmitOrderProof={setSubmitOrderProof}
          setSubmitOrderPublicSignals={setSubmitOrderPublicSignals}
        />

        {!isProvingTypeFast && (
          <NewRegistrationSubmit
            proof={submitOrderProof}
            publicSignals={submitOrderPublicSignals}
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
