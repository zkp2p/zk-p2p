import React from "react";
import styled from 'styled-components/macro'
import Link from '@mui/material/Link';
import { ENSName, AddressDisplayEnum } from 'react-ens-name';

import usePlatformSettings from "@hooks/usePlatformSettings";
import useSmartContracts from "@hooks/useSmartContracts";
import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { alchemyMainnetEthersProvider } from "index";
import { AccessoryButton } from '@components/common/AccessoryButton';
import { PaymentPlatformType } from "@helpers/types";


interface IntentRowProps {
  handleReleaseClick?: () => void;
  paymentPlatform: PaymentPlatformType | undefined;
  onRamper: string;
  amountUSDToReceive: string;
  amountUSDCToSend: string;
  expirationTimestamp: string;
}

export type IntentRowData = IntentRowProps;

export const IntentRow: React.FC<IntentRowProps> = ({
  handleReleaseClick,
  paymentPlatform,
  onRamper,
  amountUSDToReceive,
  amountUSDCToSend,
  expirationTimestamp,
}: IntentRowProps) => {
  IntentRow.displayName = "IntentRow";

  /*
   * Context
   */

  const { blockscanUrl } = useSmartContracts();

  const {
    PaymentPlatform,
  } = usePlatformSettings();

  /*
   * Helpers
   */

  const requestedAmountLabel = `${amountUSDCToSend} USDC`;
  const onRamperEtherscanLink = `${blockscanUrl}/address/${onRamper}`;
  const orderExpirationLabel = `${expirationTimestamp}`;

  function getPlatformVariables(paymentPlatform: PaymentPlatformType | undefined) {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        return {
          onRamperLinkLabel: ` on Venmo`,
          onRamperHashLabel: `$${amountUSDToReceive} from `
        };
      case PaymentPlatform.HDFC:
        return {
          onRamperLinkLabel: ` on HDFC`,
          onRamperHashLabel: `₹${amountUSDToReceive} from `
        };

      case PaymentPlatform.GARANTI:
        return {
          onRamperLinkLabel: ` on Garanti`,
          onRamperHashLabel: `₺${amountUSDToReceive} from `
        };

      default:
        return {
          currencySymbol: '$',
          paymentPlatformName: 'Venmo',
          onRamperLinkLabel: ` on Venmo`,
          onRamperHashLabel: `$${amountUSDToReceive} from `
        };
    }
  }

  const {
    onRamperLinkLabel,
    onRamperHashLabel
  } = getPlatformVariables(paymentPlatform);

  /*
   * Component
   */

  return (
    <Container>
      <IntentDetailsContainer>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <AmountLabelsContainer>
          <AmountContainer>
            <Label>Requesting:&nbsp;</Label>
            <Value>{requestedAmountLabel}</Value>
          </AmountContainer>

          <AmountContainer>
            <Label>Receive:&nbsp;</Label>
            <Value>
              {onRamperHashLabel}
              <Link href={onRamperEtherscanLink} target="_blank">
                <ENSName
                  provider={alchemyMainnetEthersProvider}
                  address={onRamper}
                  displayType={AddressDisplayEnum.FIRST6}
                />
              </Link>
              {onRamperLinkLabel}
            </Value>
          </AmountContainer>

          <AmountContainer>
            <Label>Expires:&nbsp;</Label>
            <Value>{orderExpirationLabel}</Value>
          </AmountContainer>
        </AmountLabelsContainer>

        <ActionsContainer>
          <AccessoryButton
            onClick={handleReleaseClick}
            height={36}
            loading={false}
            title={'Release'}
            icon={'unlock'}/>
        </ActionsContainer>
      </IntentDetailsContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const IntentDetailsContainer = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1.25rem 1.5rem;
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

const AmountContainer = styled.div`
  display: flex;
`;

const Label = styled.label`
  font-size: 15px;
  color: #6C757D;
`;

const Value = styled.label`
  font-size: 15px;
  color: #FFFFFF;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  flex-grow: 1;
`;
