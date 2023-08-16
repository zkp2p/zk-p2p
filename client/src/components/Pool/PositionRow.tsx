import React from "react";
import styled from 'styled-components';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


interface PositionRowProps {
  remainingDepositAmount: string;
  outstandingIntentAmount: string;
  conversionRate: string;
  convenienceFee: string;
  rowIndex: number;
}

export const PositionRow: React.FC<PositionRowProps> = ({
  remainingDepositAmount,
  outstandingIntentAmount,
  conversionRate,
  convenienceFee,
  rowIndex,
}: PositionRowProps) => {
  PositionRow.displayName = "PositionRow";

  const outstandingAndRemainingLabel = `${outstandingIntentAmount} / ${remainingDepositAmount} USDC`;

  return (
    <Container>
      <AmountContainer>
        <SVGIconThemed icon={'usdc'} width={'22'} height={'22'}/>
        <AmountLabel> {outstandingAndRemainingLabel} </AmountLabel>
      </AmountContainer>
      <FeeLabelsContainer>
        <PercentageLabel>
          <Label>Conversion Rate:</Label> <Value>{conversionRate}</Value>
        </PercentageLabel>
        <PercentageLabel>
          <Label>Convenience Fee:</Label> <Value>{convenienceFee}</Value>
        </PercentageLabel>
      </FeeLabelsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.5rem 1.5rem;
  background-color: #0D111C;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const AmountContainer = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: row;
  gap: 1rem;
  line-height: 24px;
`;

const AmountLabel = styled.label`
  display: flex;
  font-size: 18px;
  color: #FFFFFF;
  align-items: center;
`;

const FeeLabelsContainer = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding-top: 8px;
  color: #6C757D;
`;

const PercentageLabel = styled.div`
  display: flex;
`;

const Label = styled.span`
  color: #6C757D;
  font-size: 14px;
`;

const Value = styled.span`
  color: #FFFFFF;
  font-size: 14px;
  margin-left: 4px;
`;
