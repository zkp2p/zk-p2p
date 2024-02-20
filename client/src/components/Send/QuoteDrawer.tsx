import React, { useEffect, useState, useRef } from "react";
import styled from 'styled-components';
import { ChevronDown } from 'react-feather';

import { QuoteStep } from "@components/Send/QuoteStep";
import { toEthStringLong } from "@helpers/units";


const PROTOCOL_MAP: { [key: string]: string } = {
  'across': 'Across',
  'hop': 'Hop',
  'zerox': '0x',
  'cctp': 'CCTP'
};

interface QuoteDrawerProps {
  isLoading: boolean;
  isManagedWallet: boolean;
  totalGasFeeUsd?: string;
  totalGasFeeWei?: bigint;
  serviceTimeSeconds?: number;
  bridgeName?: string;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isLoading,
  isManagedWallet,
  totalGasFeeUsd,
  totalGasFeeWei,
  serviceTimeSeconds,
  bridgeName,
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

  const feeWeiString = () => {
    if (isLoading) {
      return '';
    };

    if (!totalGasFeeWei) {
      return 'Loading...';
    }

    return `${toEthStringLong(totalGasFeeWei)} ETH`
  };
  
  const gasFeeLabel = isLoading ? 'Fetching quote...' : 'Network fee';
  
  const gasFeeValue = () => {
    if (isLoading) {
      return '';
    };
    
    if (isManagedWallet) {
      return '$0';
    };

    return `$${parseFloat(totalGasFeeUsd || '0').toFixed(2)}`
  };
  
  const bridgeNameString = () => {
    if (!bridgeName) {
      return 'Unknown';
    };

    const cachedBridgeName = PROTOCOL_MAP[bridgeName];
    if (cachedBridgeName) {
      return cachedBridgeName;
    } else {
      return bridgeName.charAt(0).toUpperCase() + bridgeName.slice(1);
    }
  };
  
  const serviceTimeString = serviceTimeSeconds ? formattedServiceTime(serviceTimeSeconds) : `0 sec`;
  function formattedServiceTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    let formattedTime = "";
  
    if (minutes > 0) {
      if (remainingSeconds > 0) {
        formattedTime += `${minutes}m ${remainingSeconds}s`;
      } else {
        formattedTime += `${minutes} min`;
      }
    } else if (remainingSeconds > 0) {
      formattedTime += `${remainingSeconds} sec`;
    };
  
    return formattedTime;
  };

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
            {gasFeeValue()}
          </GasFeeValue>  

          <StyledChevronDown
            onClick={() => setIsOpen(!isOpen)}
            $isOpen={isOpen}
          />
        </GasFeeValueAndChevronContainer>
      </TitleLabelAndDropdownIconContainer>

      <QuoteStepDropdown $isOpen={isOpen}>
        <HorizontalDivider/>
        <RequirementListContainer>
          {!isManagedWallet ? (
            <QuoteStep
              label={"Fee amount"}
              value={feeWeiString()}
            />
          ) : null}

          <QuoteStep
            label={"Arrival time"}
            value={serviceTimeString}
          />

          <QuoteStep 
            label={"Route"}
            value={bridgeNameString()}
          />

          <QuoteStep
            label={"ZKP2P fee"}
            value={"$0"}
          />
        </RequirementListContainer>
      </QuoteStepDropdown>
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

interface QuoteStepDropdownProps {
  $isOpen?: boolean;
}

const QuoteStepDropdown = styled.div<QuoteStepDropdownProps>`
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
  padding-bottom: 16px;
`;
