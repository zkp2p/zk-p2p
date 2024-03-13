import React, { useEffect, useState } from "react";
import styled from 'styled-components/macro'
import Link from '@mui/material/Link';
import { ENSName, AddressDisplayEnum } from 'react-ens-name';

import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { SwapModal } from '@components/Swap/SwapModal';
import { ReviewRequirements } from '@components/modals/ReviewRequirements';
import usePlatformSettings from "@hooks/usePlatformSettings";
import useSmartContracts from "@hooks/useSmartContracts";
import { alchemyMainnetEthersProvider } from "index";
import { PaymentPlatformType } from "@helpers/types";


interface IntentRowProps {
  paymentPlatform: PaymentPlatformType | undefined;
  amountUSDCToReceive: string;
  amountUSDToSend: string;
  expirationTimestamp: string;
  depositorVenmoId: string;
  depositorName?: string;
  depositorAddress: string;
  recipientAddress: string;
  handleCompleteOrderClick: () => void;
  shouldAutoSelectIntent: boolean;
  resetShouldAutoSelectIntent: () => void;
}

export type IntentRowData = IntentRowProps;

export const IntentRow: React.FC<IntentRowProps> = ({
  paymentPlatform,
  amountUSDCToReceive,
  amountUSDToSend,
  expirationTimestamp,
  depositorVenmoId,
  depositorAddress,
  depositorName,
  recipientAddress,
  handleCompleteOrderClick,
  shouldAutoSelectIntent,
  resetShouldAutoSelectIntent,
}: IntentRowProps) => {
  IntentRow.displayName = "IntentRow";

  /*
   * Context
   */

  const { blockscanUrl } = useSmartContracts();
  const {
    PaymentPlatform,
    reviewedRequirementsForPlatform,
    markPlatformRequirementsAsReviewed
  } = usePlatformSettings();

  /*
   * State
   */

  const [shouldShowRequirementsModal, setShouldShowRequirementsModal] = useState<boolean>(false);

  const [shouldShowSwapModal, setShouldShowSwapModal] = useState<boolean>(false);

  /*
   * Helpers
   */

  const requestedAmountLabel = `${amountUSDCToReceive} USDC`;
  const depositorEtherscanLink = `${blockscanUrl}/address/${depositorAddress}`;
  const orderExpirationLabel = `${expirationTimestamp}`;

  function getPlatformVariables(paymentPlatform: PaymentPlatformType | undefined) {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        return {
          qrLink: `https://venmo.com/code?user_id=${depositorVenmoId}`,
          currencySymbol: '$',
          paymentPlatformName: 'Venmo',
        };

      case PaymentPlatform.HDFC:
        return {
          qrLink: `upi://pay?pa=${depositorVenmoId.replace(/\0/g, '')}&am=${amountUSDToSend}&cu=INR`,
          currencySymbol: '₹',
          paymentPlatformName: 'HDFC',
        };

      case PaymentPlatform.GARANTI:
        return {
          qrLink: ``,
          currencySymbol: '₺',
          paymentPlatformName: 'Garanti',
        };

      case PaymentPlatform.WISE:
        return {
          qrLink: `https://wise.com/pay/me/${depositorVenmoId}`,
          currencySymbol: '€',
          paymentPlatformName: 'Wise',
        };

      default:
        return {
          qrLink: `https://venmo.com/code?user_id=${depositorVenmoId}`,
          currencySymbol: '$',
          paymentPlatformName: 'Venmo',
        };
    }
  }

  const {
    paymentPlatformName,
    currencySymbol,
    qrLink
  } = getPlatformVariables(paymentPlatform);

  /*
   * Handlers
   */

  const handleSendClick = () => {
    if (reviewedRequirementsForPlatform()) {
      setShouldShowSwapModal(true);
    } else {
      setShouldShowRequirementsModal(true);
    }
  };

  const handleModalBackClicked = () => {
    setShouldShowRequirementsModal(false);

    setShouldShowSwapModal(false);
  };

  const handleRequirementsModalCtaClick = () => {
    markPlatformRequirementsAsReviewed();

    setShouldShowRequirementsModal(false);

    setShouldShowSwapModal(true);
  };
  
  /*
   * Effects
   */

  useEffect(() => {
    if (shouldAutoSelectIntent) {
      handleSendClick();

      resetShouldAutoSelectIntent();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoSelectIntent]);

  /*
   * Component
   */

  return (
    <Container>
      {
        shouldShowRequirementsModal && (
          <ReviewRequirements
            onBackClick={handleModalBackClicked}
            paymentPlatform={paymentPlatform || PaymentPlatform.VENMO}
            onCtaClick={handleRequirementsModalCtaClick}
          />
        )
      }

      {
        shouldShowSwapModal && (
          <SwapModal
            isVenmo={paymentPlatform === PaymentPlatform.VENMO}
            venmoId={depositorVenmoId}
            depositorName={depositorName}
            link={qrLink}
            amount={amountUSDToSend}
            onBackClick={handleModalBackClicked}
            onCompleteClick={handleCompleteOrderClick}
            paymentPlatform={paymentPlatform || PaymentPlatform.VENMO}
          />
        )
      }

      <IntentDetailsContainer>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <DetailsContainer>
          <LabelContainer>
            <Label>Depositor:&nbsp;</Label>
            <Value>
              <Link href={depositorEtherscanLink} target="_blank">
                <ENSName
                  provider={alchemyMainnetEthersProvider}
                  address={depositorAddress}
                  displayType={AddressDisplayEnum.FIRST6}
                />
              </Link>
            </Value>
          </LabelContainer>

          <LabelContainer>
            <Label>Requested:&nbsp;</Label>
            <Value>{requestedAmountLabel}</Value>
          </LabelContainer>

          <LabelContainer>
            <Label>Send:&nbsp;</Label>
            <Value>{currencySymbol}{amountUSDToSend} on {paymentPlatformName}</Value>
          </LabelContainer>

          <LabelContainer>
            <Label>Expires:&nbsp;</Label>
            <Value>{orderExpirationLabel}</Value>
          </LabelContainer>

          <LabelContainer>
            <Label>Recipient:&nbsp;</Label>
            <Value>
              <Link href={depositorEtherscanLink} target="_blank">
                <ENSName
                  provider={alchemyMainnetEthersProvider}
                  address={recipientAddress}
                  displayType={AddressDisplayEnum.FIRST6}
                />
              </Link>
            </Value>
          </LabelContainer>
        </DetailsContainer>
      </IntentDetailsContainer>

      <ActionsContainer>
        <AccessoryButton
          onClick={handleSendClick}
          height={36}
          title={'Complete'}
          icon={'send'}/>
      </ActionsContainer>
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

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem 1.5rem 1.65rem 0rem;
  gap: 1rem;
`;

const DetailsContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 2px;
  flex-direction: column;
  line-height: 24px;
`;

const LabelContainer = styled.div`
  display: flex;
`;

const Label = styled.span`
  color: #6C757D;
  font-size: 15px;
`;

const Value = styled.span`
  color: #FFFFFF;
  font-size: 15px;
`;
