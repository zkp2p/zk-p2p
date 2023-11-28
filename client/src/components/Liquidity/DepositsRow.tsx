import React from "react";
import styled from 'styled-components';
import Link from '@mui/material/Link';
import { Check } from 'react-feather';
import { ENSName, AddressDisplayEnum } from 'react-ens-name';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';
import useSmartContracts from "@hooks/useSmartContracts";
import { CustomCheckbox } from "@components/common/Checkbox"
import { alchemyMainnetEthersProvider } from "index";


interface DepositsRowProps {
  availableDepositAmount: string;
  totalDepositAmount: string;
  conversionRate: string;
  rowIndex: number;
  depositorAddress: string;
  depositId: bigint;
  targeted: boolean;
  isSelectingDeposits: boolean;
  handleTargetLiquidityCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, depositId: bigint) => void;
}

export const DepositsRow: React.FC<DepositsRowProps> = ({
  availableDepositAmount,
  totalDepositAmount,
  conversionRate,
  rowIndex,
  depositorAddress,
  depositId,
  targeted,
  isSelectingDeposits,
  handleTargetLiquidityCheckboxChange
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
   * Handlers
   */

  const onCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleTargetLiquidityCheckboxChange(event, depositId);
  };

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

      {isSelectingDeposits ? (
        <CheckboxContainer>
          <CustomCheckbox
            checked={targeted}
            onChange={onCheckboxChange}
          />
        </CheckboxContainer>
      ) : targeted ? (
        <StyledCheck />
      ) : null}
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: .2fr repeat(5, minmax(0,1fr)) .4fr;
  gap: 8px;
  flex-direction: row;
  align-items: center;
  padding: 1.25rem 1.75rem;
  justify-content: space-between;
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
`;

const StyledCheck = styled(Check)`
  color: #4BB543;
  justify-self: center;
`;

const CheckboxContainer = styled.div`
  margin: auto;
`;
