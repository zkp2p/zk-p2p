import React, { useState } from "react";
import styled from 'styled-components/macro'
import Link from '@mui/material/Link';
import { ENSName, AddressDisplayEnum } from 'ethereum-ens-name';

import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';
import { AccessoryButton } from '@components/common/AccessoryButton';
import { SwapModal } from '@components/Swap/SwapModal';
import useSmartContracts from "@hooks/useSmartContracts";
import { alchemyMainnetEthersProvider } from "index";


interface IntentRowProps {
  amountUSDCToReceive: string;
  amountUSDToSend: string;
  expirationTimestamp: string;
  depositorVenmoId: string;
  depositorAddress: string;
  recipientAddress: string;
  handleCompleteOrderClick: () => void;
}

export type IntentRowData = IntentRowProps;

export const IntentRow: React.FC<IntentRowProps> = ({
  amountUSDCToReceive,
  amountUSDToSend,
  expirationTimestamp,
  depositorVenmoId,
  depositorAddress,
  recipientAddress,
  handleCompleteOrderClick,
}: IntentRowProps) => {
  IntentRow.displayName = "IntentRow";

  /*
   * Context
   */

  const { blockscanUrl } = useSmartContracts();

  /*
   * State
   */

  const [shouldShowSwapModal, setShouldShowSwapModal] = useState<boolean>(false);

  /*
   * Helpers
   */

  const requestedAmountLabel = `${amountUSDCToReceive} USDC`;
  const venmoLink = `https://venmo.com/code?user_id=${depositorVenmoId}`;
  const depositorEtherscanLink = `${blockscanUrl}/address/${depositorAddress}`;
  const orderExpirationLabel = `${expirationTimestamp}`;
  const recipientAddressLabel = `${blockscanUrl}/address/${recipientAddress}`;

  /*
   * Handlers
   */

  const handleSendClick = () => {
    setShouldShowSwapModal(true);
  };

  const handleModalBackClicked = () => {
    setShouldShowSwapModal(false);
  };

  /*
   * Component
   */

  return (
    <Container>
      {
        shouldShowSwapModal && (
          <SwapModal
            link={venmoLink}
            amount={amountUSDToSend}
            onBackClick={handleModalBackClicked}
            onCompleteClick={handleCompleteOrderClick} />
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
                  displayType={AddressDisplayEnum.FIRST4_LAST4}
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
            <Value>${amountUSDToSend} on Venmo</Value>
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
                  displayType={AddressDisplayEnum.FIRST4_LAST4}
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
