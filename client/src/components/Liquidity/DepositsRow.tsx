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
      {rowIndex + 1}

      <SVGIconThemed icon={'usdc'} width={'28'} height={'28'}/>

      <DetailsContainer>
        <LabelContainers style={{ flex: 0.5 }}>
          <TitleAndValueContainer>
            <Label>Depositor:&nbsp;</Label>
            <Value>
              <Link href={depositorEtherscanLink} target="_blank">
                <ENSName
                  provider={alchemyMainnetEthersProvider}
                  address={depositorAddress}
                  displayType={AddressDisplayEnum.FIRST4_LAST4}
                />
              </Link>
            </Value>
          </TitleAndValueContainer>

          <PercentageLabel>
            <Label>Conversion Rate:</Label>
            <Value>{conversionRate}</Value>
          </PercentageLabel>
        </LabelContainers>

        <LabelContainers style={{ flex: 0.6 }}>
          <TitleAndValueContainer>
            <Label>Deposit Amount:&nbsp;</Label>
            <Value>{originalAmountLabel}</Value>
          </TitleAndValueContainer>

          <TitleAndValueContainer>
            <Label>Remaining Liquidity:&nbsp;</Label>
            <Value>{depositRemainingLabel}</Value>
          </TitleAndValueContainer>
        </LabelContainers>
      </DetailsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 2rem;
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  line-height: 24px;
`;

const LabelContainers = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const TitleAndValueContainer = styled.label`
  display: flex;
  font-size: 15px;
  color: #FFFFFF;
  align-items: center;
`;

const Label = styled.span`
  font-size: 15px;
  color: #6C757D;
`;

const PercentageLabel = styled.div`
  display: flex;
`;

const Value = styled.span`
  color: #FFFFFF;
  font-size: 15px;
  margin-left: 4px;
`;
