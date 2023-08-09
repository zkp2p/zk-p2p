import React from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';

import { Button } from "../Button";
import { RowBetween } from '../layouts/Row'
import { Col } from "../legacy/Layout";
import { ThemedText } from '../../theme/text'
import { NumberedStep } from "../common/NumberedStep";


interface NewPermissionProps {
  loggedInWalletAddress: string;
  handleBackClick: () => void;
}
 
export const NewPermission: React.FC<NewPermissionProps> = ({
  loggedInWalletAddress,
  handleBackClick
}) => {
  
  return (
    <Container>
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
          Create a new counterparty permission.
        </NumberedStep>
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
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  gap: 1rem;
`;

const Body = styled(Col)`
  gap: 0.75rem;
`;

const ButtonContainer = styled.div`
  display: grid;
`;

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`
