import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from "../Button";
import { Col, SubHeader } from "../legacy/Layout";
import { NumberedStep } from "../legacy/NumberedStep";
import { ReadOnlyInput } from "../legacy/ReadOnlyInput";
import { SingleLineInput } from "../legacy/SingleLineInput";


interface ExistingRegistrationProps {
  // loggedInWalletAddress: string;
  // senderRequestedAmountDisplay: number;
}
 
export const ExistingRegistration: React.FC<ExistingRegistrationProps> = ({
  // loggedInWalletAddress,
  // senderRequestedAmountDisplay,
}) => {
  const loggedInWalletAddress = '';
  const [venmoIDInput, setVenmoIDInput] = useState<string>('');

  /*
    Hooks
  */

  useEffect(() => {
    setVenmoIDInput('');
  }, [loggedInWalletAddress]);

  /*
    Component
  */
  return (
    <Container>
      <SubHeader>Existing Registration</SubHeader>
      <Body>
        <NumberedInputContainer>
          <NumberedStep>
            Your Venmo ID is hashed on chain to conceal your identity. Verify your existing registered ID by pasting your
            Venmo ID below and tapping verify
          </NumberedStep>
        </NumberedInputContainer>
        <ReadOnlyInput
          label="Current Registration Status"
          value="Registered"
        />
        <SingleLineInput
          label="Verify Venmo ID"
          value="645716473020416186"
          placeholder={'1234567891011121314'}
          onChange={(e) => {
            setVenmoIDInput(e.currentTarget.value);
          }}
        />
        <Button
          onClick={async () => {
            // TODO: Poseidon hash venmoIDInput and give feedback if it matches the existing registration
          }}
          >
          Verify
        </Button>
      </Body>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const NumberedInputContainer = styled(Col)`
  gap: 1rem;
`;
