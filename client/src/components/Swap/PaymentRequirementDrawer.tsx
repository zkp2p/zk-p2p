import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { ChevronDown } from 'react-feather';

import { InstructionStep } from "@components/Swap/InstructionStep";
import { platformStrings } from "@helpers/strings";
import { PaymentPlatformType } from '@helpers/types';
import { colors } from '@theme/colors';


interface PaymentRequirementDrawerProps {
  paymentPlatform: PaymentPlatformType
}

export const PaymentRequirementDrawer: React.FC<PaymentRequirementDrawerProps> = ({
  paymentPlatform
}) => {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * State
   */

  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  /*
   * Component
   */

  const optionalPlatformRequirement = () => {
    const requirementCopy = platformStrings.getForPlatform(paymentPlatform, 'PAYMENT_REQUIREMENT_STEP_FOUR');
    return requirementCopy ? (
      <InstructionStep step={4}>
        {requirementCopy}
      </InstructionStep>
    ) : null;
  };

  return (
    <Wrapper ref={ref}>
      <TitleLabelAndDropdownIconContainer>
        <TokenLabel>
          Review Requirements
        </TokenLabel>
        
        <StyledChevronDown
          onClick={toggleOpen}
          $isOpen={isOpen}
        />
      </TitleLabelAndDropdownIconContainer>

      <InstructionsDropdown $isOpen={isOpen}>
        <HorizontalDivider/>
        <RequirementListContainer>
          <InstructionStep step={1}>
            { platformStrings.getForPlatform(paymentPlatform, 'PAYMENT_REQUIREMENT_STEP_ONE') }
          </InstructionStep>

          <span style={paymentPlatform === "garanti" ? { textDecoration: 'underline', fontWeight: 'bold' } : undefined}>
            <InstructionStep step={2}>
              { platformStrings.getForPlatform(paymentPlatform, 'PAYMENT_REQUIREMENT_STEP_TWO') }
            </InstructionStep>

            <InstructionStep step={3}>
              { platformStrings.getForPlatform(paymentPlatform, 'PAYMENT_REQUIREMENT_STEP_THREE') }
            </InstructionStep>
          </span>

          {optionalPlatformRequirement()}
        </RequirementListContainer>

        <DisclaimerLabel>
          Not meeting requirements will lead to lost funds
        </DisclaimerLabel>
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
  border-radius: 16px;
  border: 1px solid ${colors.defaultBorderColor};
  background-color: ${colors.container};
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

const RequirementListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DisclaimerLabel = styled.button`
  font-size: 14px;
  font-family: 'Graphik';
  color: #df2e2d;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  padding-bottom: 20px;
  background: none;
  border: none;
`;
