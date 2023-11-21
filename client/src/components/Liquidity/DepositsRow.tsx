import React from "react";
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { ENSName, AddressDisplayEnum } from 'ethereum-ens-name';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';
import useSmartContracts from "@hooks/useSmartContracts";
import { alchemyMainnetEthersProvider } from "index";


interface DepositsRowProps {
  availableDepositAmount: string;
  totalDepositAmount: string;
  conversionRate: string;
  rowIndex: number;
  depositorAddress: string;
}

export const DepositsRow: React.FC<DepositsRowProps> = ({
  availableDepositAmount,
  totalDepositAmount,
  conversionRate,
  rowIndex,
  depositorAddress
}: DepositsRowProps) => {
  DepositsRow.displayName = "DepositsRow";

  /*
   * Context
   */

  const { blockscanUrl } = useSmartContracts();

  /*
   * Helpers
   */

  const depositRemainingLabel = `${availableDepositAmount}`;
  const originalAmountLabel = `${totalDepositAmount}`
  const depositorEtherscanLink = `${blockscanUrl}/address/${depositorAddress}`;

  /*
   * Component
   */

  return (
    <Container>
      <SummaryLabelsAndIconContainer>
        {rowIndex + 1}

        <SVGIconThemed icon={'usdc'} width={'28'} height={'28'}/>

        <LabelsContainer>
          <LabelSubcontainer>
            <SummaryLabel>
              <SummaryLabelTitle>Depositor:&nbsp;</SummaryLabelTitle>
              <SummaryLabelValue>
                <Link href={depositorEtherscanLink} target="_blank">
                  <ENSName
                    provider={alchemyMainnetEthersProvider}
                    address={depositorAddress}
                    displayType={AddressDisplayEnum.FIRST4_LAST4}
                  />
                </Link>
              </SummaryLabelValue>
            </SummaryLabel>

            <PercentageLabel>
              <Label>Conversion Rate:</Label>
              <Value>{conversionRate}</Value>
            </PercentageLabel>
          </LabelSubcontainer>

          <LabelSubcontainer>
            <SummaryLabel>
              <SummaryLabelTitle>Deposit Amount:&nbsp;</SummaryLabelTitle>
              <SummaryLabelValue>{originalAmountLabel}</SummaryLabelValue>
            </SummaryLabel>

            <SummaryLabel>
              <SummaryLabelTitle>Remaining Liquidity:&nbsp;</SummaryLabelTitle>
              <SummaryLabelValue>{depositRemainingLabel}</SummaryLabelValue>
            </SummaryLabel>
          </LabelSubcontainer>
        </LabelsContainer>
      </SummaryLabelsAndIconContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: flex-start;
  padding: 1.5rem;
`;

const SummaryLabelsAndIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const LabelsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  line-height: 24px;
  gap: 2rem;
`;

const LabelSubcontainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
