import React from "react";
import styled from 'styled-components/macro'

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


interface IntentRowProps {
  onRamper: string;
  amountUSDToReceive: string;
  amountUSDCToSend: string;
  expirationTimestamp: string;
}

export type IntentRowData = IntentRowProps;

export const IntentRow: React.FC<IntentRowProps> = ({
  onRamper,
  amountUSDToReceive,
  amountUSDCToSend,
  expirationTimestamp,
}: IntentRowProps) => {
  IntentRow.displayName = "IntentRow";

  const requestedAmountLabel = `Request ${amountUSDCToSend} USDC`;
  const onRamperHashLabel = `Receive $${amountUSDToReceive} from ${onRamper} on Venmo`;
  const timeRemainingLabel = `Expires: ${expirationTimestamp}`;

  return (
    <Container>
      <VenmoHashContainer>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <AmountLabelsContainer>
          <AmountLabel>
            {requestedAmountLabel}
          </AmountLabel>
          
          <AmountLabel>
            {onRamperHashLabel}
          </AmountLabel>
          
          <AmountLabel>
            {timeRemainingLabel}
          </AmountLabel>
        </AmountLabelsContainer>
      </VenmoHashContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;

  &:focus-within {
    border-color: #CED4DA;
    border-width: 1px;
  }
`;

const VenmoHashContainer = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: row;
  align-items: center;
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

const AmountLabel = styled.label`
  display: flex;
  font-size: 15px;
  color: #FFFFFF;
  align-items: center;
`;
