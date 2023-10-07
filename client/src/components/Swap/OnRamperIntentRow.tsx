import React from "react";
import styled from 'styled-components/macro'

import { StyledLink } from '../legacy/StyledLink';
import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


interface IntentRowProps {
  amountUSDCToReceive: string;
  amountUSDToSend: string;
  expirationTimestamp: string;
  depositorVenmoId: string;
}

export type IntentRowData = IntentRowProps;

export const IntentRow: React.FC<IntentRowProps> = ({
  amountUSDCToReceive,
  amountUSDToSend,
  expirationTimestamp,
  depositorVenmoId,
}: IntentRowProps) => {
  IntentRow.displayName = "IntentRow";

  const requestedAmountLabel = `Open Order: ${amountUSDCToReceive} USDC`;
  const venmoLink = `https://venmo.com/code?user_id=${depositorVenmoId}`;
  const timeRemainingLabel = `Expires: ${expirationTimestamp}`;

  return (
    <Container>
      <AddressContainer>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <AmountLabelsContainer>
          <AmountLabel> {requestedAmountLabel} </AmountLabel>
          <AmountLabel>
            Complete
              <StyledLink urlHyperlink={venmoLink} label={' Venmo '}
            /> payment for {amountUSDToSend}
          </AmountLabel>
          <AmountLabel> {timeRemainingLabel} </AmountLabel>
        </AmountLabelsContainer>
      </AddressContainer>
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

const AddressContainer = styled.div`
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
