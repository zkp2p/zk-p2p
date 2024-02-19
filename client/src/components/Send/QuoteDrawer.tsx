import React, { useEffect, useState, useRef } from "react";
import styled from 'styled-components';
import { ChevronDown } from 'react-feather';

import { QuoteStep } from "@components/Send/QuoteStep";


interface QuoteDrawerProps {
  isLoading: boolean;
  totalGasFeeUsd?: string;
  serviceTimeSeconds?: number;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isLoading,
  totalGasFeeUsd,
  serviceTimeSeconds
}) => {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * State
   */

  const [isOpen, setIsOpen] = useState(false);

  /*
   * Hooks
   */

  useEffect(() => {
    if (isLoading) {
      setIsOpen(false);
    }
  }, [isLoading]);

  /*
   * Helpers
   */

  const serviceTimeString = `~${serviceTimeSeconds} seconds`;
  const gasFeeLabel = isLoading ? 'Fetching quote...' : 'Fee estimate';
  const gasFeeValue = isLoading ? '' : `$${parseFloat(totalGasFeeUsd || '0').toFixed(2)}`;

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <TitleLabelAndDropdownIconContainer>
        <GasFeeLabel>
          {gasFeeLabel}
        </GasFeeLabel>

        <GasFeeValueAndChevronContainer>
          <GasFeeValue>
            {gasFeeValue}
          </GasFeeValue>  

          <StyledChevronDown
            onClick={() => setIsOpen(!isOpen)}
            $isOpen={isOpen}
          />
        </GasFeeValueAndChevronContainer>
      </TitleLabelAndDropdownIconContainer>

      <InstructionsDropdown $isOpen={isOpen}>
        <HorizontalDivider/>
        <RequirementListContainer>
          <QuoteStep 
            label={"Bridge fee"}
            value={gasFeeValue}
          />

          <QuoteStep 
            label={"Route"}
            value={"Hop"}
          />

          <QuoteStep
            label={"Estimated bridge time"}
            value={serviceTimeString}
          />

          <QuoteStep
            label={"ZKP2P fee"}
            value={"$0"}
          />
        </RequirementListContainer>
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
  border: 1px solid #98a1c03d;
  background: #141A2A;
`;

const TitleLabelAndDropdownIconContainer = styled.div`
  width: 100%;
  height: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0px 10px;
`;

const GasFeeLabel = styled.div`
  font-size: 14px;
`;

const GasFeeValueAndChevronContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  justify-content: space-between;
  gap: 8px;
`;

const GasFeeValue = styled.div`
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
  border-top: 1px solid #98a1c03d;
`;

interface InstructionsDropdownProps {
  $isOpen?: boolean;
}

const InstructionsDropdown = styled.div<InstructionsDropdownProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #141A2A;
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
  padding-bottom: 14px;
`;
