import React from "react";
import styled from 'styled-components';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


interface PositionRowProps {
  depositorHash: string;
  availableDepositAmount: string;
  totalDepositAmount: string;
  outstandingIntentAmount: string;
  intentCount: string;
  conversionRate: string;
  convenienceFee: string;
  rowIndex: number;
}

export const PositionRow: React.FC<PositionRowProps> = ({
  depositorHash,
  availableDepositAmount,
  totalDepositAmount,
  outstandingIntentAmount,
  intentCount,
  conversionRate,
  convenienceFee,
  rowIndex,
}: PositionRowProps) => {
  PositionRow.displayName = "PositionRow";

  const depositRemainingLabel = `Available USDC: ${availableDepositAmount} / ${totalDepositAmount}`;
  const intentAmountLabel = `Outstanding Intents: ${intentCount} (${outstandingIntentAmount})`;

  return (
    <Container>
      <AmountContainer>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <AmountLabelsContainer>
          <AmountLabel> {depositRemainingLabel} </AmountLabel>
          <AmountLabel> {intentAmountLabel} </AmountLabel>
        </AmountLabelsContainer>
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
  padding: 1.5rem;
`;

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
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

const FeeLabelsContainer = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding-top: 12px;
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
