import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X } from 'react-feather';
import QRCode from "react-qr-code";

import { ThemedText } from '../../theme/text'
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


interface TokenSelectorProps {
  defaultToken: string;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  defaultToken,
}) => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    toggleOpen();
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <LogoAndTokenLabel>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>

        <ThemedText.LabelSmall>
          USDC
        </ThemedText.LabelSmall>
      </LogoAndTokenLabel>

      {isOpen && (
        <ModalContainer>
          <RowBetween>
            <div style={{ flex: 0.25 }}>
              <button
                onClick={handleOverlayClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <StyledArrowLeft/>
              </button>
            </div>

            <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
              Send Venmo Payment
            </ThemedText.HeadlineSmall>

            <div style={{ flex: 0.25 }}/>
          </RowBetween>
        </ModalContainer>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LogoAndTokenLabel = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  corner-radius: 24px;
  background: #252628;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StyledArrowLeft = styled(X)`
  color: #FFF;
`;

const ModalContainer = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 1rem;
  background: #0D111C;
  justify-content: space-between;
  color: #FFF;
  align-items: center;
  z-index: 20;
  gap: 1.5rem;
  top: 24%;
  position: relative;
`;

const RowBetween = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
`;
