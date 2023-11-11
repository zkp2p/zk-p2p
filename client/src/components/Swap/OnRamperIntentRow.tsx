import React, { useState } from "react";
import styled from 'styled-components/macro'
import Link from '@mui/material/Link';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { PaymentModal } from '@components/Swap/PaymentModal';


interface IntentRowProps {
  amountUSDCToReceive: string;
  amountUSDToSend: string;
  expirationTimestamp: string;
  depositorVenmoId: string;
  depositorAddress: string;
  handleCompleteOrderClick: () => void;
}

export type IntentRowData = IntentRowProps;

export const IntentRow: React.FC<IntentRowProps> = ({
  amountUSDCToReceive,
  amountUSDToSend,
  expirationTimestamp,
  depositorVenmoId,
  depositorAddress,
  handleCompleteOrderClick,
}: IntentRowProps) => {
  IntentRow.displayName = "IntentRow";

  /*
   * State
   */

  const [shouldShowPaymentModal, setShouldShowPaymentModal] = useState<boolean>(false);

  /*
   * Helpers
   */

  const requestedAmountLabel = `${amountUSDCToReceive} USDC`;
  const venmoLink = `https://venmo.com/code?user_id=${depositorVenmoId}`;
  const depositorEtherscanLink = `https://etherscan.io/address/${depositorAddress}`;
  const orderExpirationLabel = `${expirationTimestamp}`;

  /*
   * Handlers
   */

  const handleSendClick = () => {
    setShouldShowPaymentModal(true);
  };

  const handleModalBackClicked = () => {
    setShouldShowPaymentModal(false);
  };

  /*
   * Component
   */

  return (
    <Container>
      {
        shouldShowPaymentModal && (
          <PaymentModal
            link={venmoLink}
            amount={amountUSDToSend}
            onBackClick={handleModalBackClicked}
            onCompleteClick={handleCompleteOrderClick} />
        ) 
      }

      <IntentDetailsContainer>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <AmountLabelsContainer>
          <AmountContainer>
            <Label>Offramper:&nbsp;</Label>
            <Value>
              <Link href={depositorEtherscanLink} target="_blank">
                Account ↗
              </Link>
            </Value>
          </AmountContainer>

          <AmountContainer>
            <Label>Requested:&nbsp;</Label>
            <Value>{requestedAmountLabel}</Value>
          </AmountContainer>
          
          <AmountContainer>
            <Label>Send:&nbsp;</Label>
            <Value>{amountUSDToSend} on Venmo</Value>
          </AmountContainer>
          
          <AmountContainer>
            <Label>Expires:&nbsp;</Label>
            <Value>{orderExpirationLabel}</Value>
          </AmountContainer>
        </AmountLabelsContainer>
      </IntentDetailsContainer>

      <ActionsContainer>
        <AccessoryButton
          onClick={handleSendClick}
          height={36}
          title={'Send'}
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

const Label = styled.span`
  color: #6C757D;
  font-size: 15px;
`;

const Value = styled.span`
  color: #FFFFFF;
  font-size: 15px;
`;
