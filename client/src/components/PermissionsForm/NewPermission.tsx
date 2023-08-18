import React, { useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';

import { Button } from "../Button";
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { NumberedStep } from "../common/NumberedStep";
import { SingleLineInput } from "../common/SingleLineInput";


interface NewPermissionProps {
  loggedInWalletAddress: string;
  handleBackClick: () => void;
}
 
export const NewPermission: React.FC<NewPermissionProps> = ({
  loggedInWalletAddress,
  handleBackClick
}) => {
  const [userHash, setUserHash] = useState<string>('');

  return (
    <Container>
      <Column>
        <RowBetween style={{ padding: '0.25rem 0rem 1.5rem 0rem' }}>
          <button
            onClick={handleBackClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <StyledArrowLeft/>
          </button>
          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            New Permission
          </ThemedText.HeadlineSmall>
        </RowBetween>

        <Body>
          <NumberedStep>
            Add a new user hash to your deny list. Restricted users are prohibited from submitting intents on your deposits.
          </NumberedStep>
          <SingleLineInput
            label="Venmo Hash"
            value={userHash}
            placeholder={'0x12345678910'}
            onChange={(e) => {
              setUserHash(e.currentTarget.value);
            }}
          />
          <ButtonContainer>
            <Button
              onClick={async () => {
                console.log("Do something...");
              }}
            >
              Submit
            </Button>
          </ButtonContainer>
        </Body>
      </Column>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #0D111C;
`;

const ButtonContainer = styled.div`
  display: grid;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`
