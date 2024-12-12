import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { ChevronDown } from 'react-feather';

import { InstructionStep } from "@components/Swap/InstructionStep";
import { Input } from "@components/common/Input";
import { platformStrings } from "@helpers/strings";
import useQuery from '@hooks/useQuery';
import { PaymentPlatformType } from '@helpers/types';
import { colors } from '@theme/colors';


interface InstructionDrawerProps {
  recipientAddress?: string;
  setRecipientAddress: (address: string) => void;
  isLoggedIn: boolean;
  paymentPlatform: PaymentPlatformType
}

export const InstructionDrawer: React.FC<InstructionDrawerProps> = ({
  recipientAddress,
  setRecipientAddress,
  isLoggedIn,
  paymentPlatform,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { navigateWithQuery } = useQuery();

  /*
   * State
   */

  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  /*
   * Handlers
   */

  const navigateToDepositsHandler = () => {
    navigateWithQuery('/deposits');
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <TitleLabelAndDropdownIconContainer>
        <TokenLabel>
          Instructions
        </TokenLabel>
        
        <StyledChevronDown
          onClick={toggleOpen}
          $isOpen={isOpen}
        />
      </TitleLabelAndDropdownIconContainer>

      <InstructionsDropdown $isOpen={isOpen}>
        <HorizontalDivider/>
        <InstructionListContainer>
          <InstructionStep step={1}>
            { platformStrings.getForPlatform(paymentPlatform, 'INSTRUCTION_DRAWER_STEP_ONE') }
          </InstructionStep>

          <InstructionStep step={2}>
            { platformStrings.getForPlatform(paymentPlatform, 'INSTRUCTION_DRAWER_STEP_TWO') }
          </InstructionStep>

          <InputWrapper>
            <Input
              label="Recipient"
              name="recipientAddress"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder={!isLoggedIn ? 'Wallet disconnected' : 'Recipient address'}
              readOnly={!isLoggedIn}
            />
          </InputWrapper>

          <InstructionStep step={3}>
            { platformStrings.getForPlatform(paymentPlatform, 'INSTRUCTION_DRAWER_STEP_THREE') }
          </InstructionStep>

          <InstructionStep step={4}>
            { platformStrings.getForPlatform(paymentPlatform, 'INSTRUCTION_DRAWER_STEP_FOUR') }
          </InstructionStep>
        </InstructionListContainer>

        <LiquidityLink onClick={navigateToDepositsHandler}>
          Interested in providing liquidity?
        </LiquidityLink>
      </InstructionsDropdown>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px 20px;
  background-color: ${colors.container};
  overflow: hidden;

  @media (min-width: 600px) {
    border-radius: 16px;
    border: 1px solid ${colors.defaultBorderColor};
  }
`;

const TitleLabelAndDropdownIconContainer = styled.div`
  width: 100%;
  height: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0px 12px;
`;

const TokenLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

interface StyledChevronDownProps {
  $isOpen?: boolean;
}

const StyledChevronDown = styled(ChevronDown)<StyledChevronDownProps>`
  width: 20px;
  height: 20px;
  color: #CED4DA;

  transition: transform 0.4s;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const HorizontalDivider = styled.div`
  width: 100%;
  border-top: 1px solid ${colors.defaultBorderColor};
`;

interface InstructionsDropdownProps {
  $isOpen?: boolean;
}

const InstructionsDropdown = styled.div<InstructionsDropdownProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${colors.container};
  color: #FFF;
  align-items: center;
  gap: 16px;
  overflow: hidden;

  max-height: ${({ $isOpen }) => $isOpen ? '500px' : '0px'};
  transition: max-height 0.4s ease-out;
`;

const InstructionListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputWrapper = styled.div`
  padding: 0 20px;
`;

const LiquidityLink = styled.button`
  font-size: 14px;
  font-family: 'Graphik';
  color: #FFFFFF;
  opacity: 0.3;
  text-align: center;
  padding-bottom: 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  display: inline;
`;
