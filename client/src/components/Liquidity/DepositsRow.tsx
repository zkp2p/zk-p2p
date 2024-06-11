import React from "react";
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { ENSName, AddressDisplayEnum } from 'react-ens-name';

import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import useSmartContracts from "@hooks/useSmartContracts";
import { alchemyMainnetEthersProvider } from "index";
import { PaymentPlatformType, paymentPlatformInfo } from "@helpers/types";
import useMediaQuery from "@hooks/useMediaQuery";


interface DepositsRowProps {
  paymentPlatform: PaymentPlatformType;
  availableDepositAmount: string;
  conversionRate: string;
  conversionCurrency: string;
  rowIndex: number;
  depositorAddress: string;
}

export const DepositsRow: React.FC<DepositsRowProps> = ({
  paymentPlatform,
  availableDepositAmount,
  conversionRate,
  conversionCurrency,
  rowIndex,
  depositorAddress,
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
  const depositorEtherscanLink = `${blockscanUrl}/address/${depositorAddress}`;
  const isMobile = useMediaQuery() === 'mobile';
  const svgSize = isMobile ? '20' : '28';

  /*
   * Component
   */

  return (
    <Container>
      <div style={{ flex: 0.1, fontSize: isMobile ? '12px' : '16px' }}>
        {rowIndex + 1}
      </div>

      {!isMobile &&
        <IconAndTokenNameContainer>
          <SVGIconThemed icon={'usdc'} width={svgSize} height={svgSize} />
          USD Coin
        </IconAndTokenNameContainer>
      }

      {!isMobile &&
        <TitleAndValueContainer>
          <Value>{paymentPlatformInfo[paymentPlatform].platformName}</Value>
        </TitleAndValueContainer>
      }

      <TitleAndValueContainer>
        <Value>
          <Link href={depositorEtherscanLink} target="_blank">
            <ENSNameWrapper>
              <ENSName
                provider={alchemyMainnetEthersProvider}
                address={depositorAddress}
                displayType={AddressDisplayEnum.FIRST6}
              />
            </ENSNameWrapper>
          </Link>
        </Value>
      </TitleAndValueContainer>

      <TitleAndValueContainer>
        <Value>{depositRemainingLabel} USDC</Value>
      </TitleAndValueContainer>

      <PercentageLabel>
        <Value>{`${conversionRate} ${conversionCurrency}`}</Value>
      </PercentageLabel>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: .1fr 0.75fr 1.1fr 1fr;
  gap: 8px;
  flex-direction: row;
  align-items: center;
  padding: 1.25rem 1.5rem;
  justify-content: space-between;
  text-align: left;

  @media (min-width: 600px) {
    grid-template-columns: .2fr .9fr .6fr 1.1fr repeat(2, minmax(0,1fr));
    padding: 1.25rem 1.75rem;
  }
`;

const IconAndTokenNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #FFFFFF;

  @media (max-width: 600px) {
    font-size: 13px;
  };
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

  @media (max-width: 600px) {
    font-size: 14px;
  };
`;

const ENSNameWrapper = styled.div`
  max-width: 144px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
