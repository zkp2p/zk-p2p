import React from "react";
import styled, { css } from 'styled-components/macro'

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


interface IntentRowProps {
  venmoHash: string;
  amount: string;
  timestamp: string;
}

export type IntentRowData = IntentRowProps;

export const IntentRow: React.FC<IntentRowProps> = ({
  venmoHash,
  amount,
  timestamp,
}: IntentRowProps) => {
  IntentRow.displayName = "IntentRow";

  const depositAmountLabel = `${amount} USDC`;
  const timeRemainingLabel = `Time Remaining: ${timestamp}`;

  return (
    <Container>
      <VenmoHashContainer>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <AmountLabelsContainer>
          <AmountLabel> {depositAmountLabel} </AmountLabel>
          <AmountLabel> {timeRemainingLabel} </AmountLabel>
        </AmountLabelsContainer>
      </VenmoHashContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const VenmoHashContainer = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.25rem;
  line-height: 24px;
`;

const AmountLabelsContainer = styled.div`
  width: 100%; 
  display: flex;
  gap: 2px;
  flex-direction: column;
  line-height: 24px;
`;

const AmountLabel = styled.label`
  display: flex;
  font-size: 15px;
  color: #FFFFFF;
  align-items: center;
`;
