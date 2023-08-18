import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';

import { Button } from "../Button";
import { RowBetween } from '../layouts/Row'
import { ThemedText } from '../../theme/text'
import { NumberedStep } from "../common/NumberedStep";
import { SingleLineInput } from "../common/SingleLineInput";


interface NewPositionProps {
  loggedInWalletAddress: string;
  handleBackClick: () => void;
}
 
export const NewPosition: React.FC<NewPositionProps> = ({
  loggedInWalletAddress,
  handleBackClick
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);

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
            New Position
          </ThemedText.HeadlineSmall>
        </RowBetween>

        <Body>
          <NumberedStep>
            Create a new pool position by specifying the amount of USDC you want to deposit and the conversion rate you want to charge.
          </NumberedStep>
          <SingleLineInput
            label="Deposit Amount"
            value={depositAmount === 0 ? '' : depositAmount.toString()}
            placeholder={'1000'}
            onChange={(e) => {
              setDepositAmount(e.currentTarget.value);
            }}
          />
          <SingleLineInput
            label="Conversion Rate"
            value={conversionRate === 0 ? '' : conversionRate.toString()}
            placeholder={'3.25'}
            onChange={(e) => {
              setConversionRate(e.currentTarget.value);
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
