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
      <div style={{ flex: 0.1 }}>
        {rowIndex + 1}
      </div>

      <IconAndTokenNameContainer>
        <SVGIconThemed icon={'usdc'} width={'28'} height={'28'} />
        USD Coin
      </IconAndTokenNameContainer>

      <TitleAndValueContainer>
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

      <TitleAndValueContainer>
        <Value>{depositRemainingLabel}</Value>
      </TitleAndValueContainer>

      <PercentageLabel>
        <Value>{conversionRate}</Value>
      </PercentageLabel>

      <TitleAndValueContainer>
        <Value>{originalAmountLabel}</Value>
      </TitleAndValueContainer>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: .2fr repeat(5, minmax(0,1fr));
  gap: 8px;
  flex-direction: row;
  align-items: center;
  padding: 1.25rem 1.75rem;
  justify-content: space-between;
  align-items: flex-start;
  line-height: 24px;
  text-align: left;
`;

const IconAndTokenNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #FFFFFF;
`;

const TitleAndValueContainer = styled.label`
  display: flex;
  font-size: 15px;
  color: #FFFFFF;
  align-items: center;
`;

const PercentageLabel = styled.div`
  display: flex;
`;

const Value = styled.span`
  color: #FFFFFF;
  font-size: 15px;
  margin-left: 4px;
`;
