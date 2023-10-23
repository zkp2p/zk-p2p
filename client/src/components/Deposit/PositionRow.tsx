import React from "react";
import styled from 'styled-components';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';
import { AccessoryButton } from '@components/common/AccessoryButton';


interface PositionRowProps {
  depositorHash: string;
  availableDepositAmount: string;
  totalDepositAmount: string;
  outstandingIntentAmount: string;
  intentCount: string;
  conversionRate: string;
  rowIndex: number;
  handleWithdrawClick: () => void;
}

export const PositionRow: React.FC<PositionRowProps> = ({
  depositorHash,
  availableDepositAmount,
  totalDepositAmount,
  outstandingIntentAmount,
  intentCount,
  conversionRate,
  rowIndex,
  handleWithdrawClick
}: PositionRowProps) => {
  PositionRow.displayName = "PositionRow";

  const depositRemainingLabel = `${availableDepositAmount} USDC`;
  const intentAmountLabel = `${intentCount} (${outstandingIntentAmount} USDC)`;
  const originalAmountLabel = `${totalDepositAmount} USDC`

  return (
    <Container>
      <PositionDetailsContainer>
        <SummaryLabelsAndIconContainer>
          <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
          <SummaryLabelsContainer>
            <SummaryLabel>
              <SummaryLabelTitle>Available USDC:&nbsp;</SummaryLabelTitle>
              <SummaryLabelValue>{depositRemainingLabel}</SummaryLabelValue>
            </SummaryLabel>
            
            <SummaryLabel>
              <SummaryLabelTitle>Outstanding Orders:&nbsp;</SummaryLabelTitle>
              <SummaryLabelValue>{intentAmountLabel}</SummaryLabelValue>
            </SummaryLabel>

            <PercentageLabel>
              <Label>Conversion Rate:</Label>
              <Value>{conversionRate}</Value>
            </PercentageLabel>

            <SummaryLabel>
              <SummaryLabelTitle>Deposit Amount:&nbsp;</SummaryLabelTitle>
              <SummaryLabelValue>{originalAmountLabel}</SummaryLabelValue>
            </SummaryLabel>
          </SummaryLabelsContainer>
        </SummaryLabelsAndIconContainer>
      </PositionDetailsContainer>

      <ActionsContainer>
        <AccessoryButton
          onClick={handleWithdrawClick}
          height={36}
          title={'Withdraw'}
          icon={'logout'}/>
      </ActionsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const PositionDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.5rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding-right 1.5rem;
  flex-grow: 1;
`;

const SummaryLabelsAndIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const SummaryLabelsContainer = styled.div`
  width: 100%; 
  display: flex;
  gap: 2px;
  flex-direction: column;
  line-height: 24px;
`;

const SummaryLabel = styled.label`
  display: flex;
  font-size: 15px;
  color: #FFFFFF;
  align-items: center;
`;

const SummaryLabelTitle = styled.span`
  font-size: 15px;
  color: #6C757D;
`;

const SummaryLabelValue = styled.span`
  font-size: 15px;
  color: #FFFFFF;
`;

const PercentageLabel = styled.div`
  display: flex;
`;

const Label = styled.span`
  color: #6C757D;
  font-size: 15px;
`;

const Value = styled.span`
  color: #FFFFFF;
  font-size: 15px;
  margin-left: 4px;
`;
