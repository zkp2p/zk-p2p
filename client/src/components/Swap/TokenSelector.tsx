import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X, ChevronDown } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '../../theme/text'
import { Overlay } from '@components/modals/Overlay';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { SVGIconThemed } from '../SVGIcon/SVGIconThemed';


export const TokenSelector: React.FC = () => {
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
      <LogoAndTokenLabel onClick={toggleOpen}>
        <SVGIconThemed icon={'usdc'} width={'24'} height={'24'}/>
        <TokenLabel>
          USDC
        </TokenLabel>
        <StyledChevronDown/>
      </LogoAndTokenLabel>

      {isOpen && (
        <ModalAndOverlayContainer>
          <Overlay onClick={handleOverlayClick}/>

          <ModalContainer>
            <RowBetween>
              <ThemedText.SubHeader>
                Select a Token
              </ThemedText.SubHeader>

              <button
                onClick={handleOverlayClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <StyledX/>
              </button>
            </RowBetween>

            <InstructionsLabel>
              We currently only support USDC, but will be adding support for other tokens. Please let us know which tokens
              you are interested in seeing ZKP2P add support for. <Link href="https://zkp2p.gitbook.io/zkp2p/user-guides/on-ramping" target="_blank">
                Give feedback ↗
              </Link>
            </InstructionsLabel>
          </ModalContainer>
        </ModalAndOverlayContainer>
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
  border-radius: 24px;
  background: #0D111C;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 4px;
  gap: 4px;
`;

const TokenLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #FFF;
  padding-top: 2px;
`;

const StyledX = styled(X)`
  color: #FFF;
`;

const StyledChevronDown = styled(ChevronDown)`
  color: #FFF;
`;

const ModalAndOverlayContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  align-items: flex-start;
  top: 0;
  left: 0;
  z-index: 10;
`;

const ModalContainer = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  background: #0D111C;
  color: #FFF;
  align-items: center;
  z-index: 20;
  gap: 1.5rem;
  top: 33%;
  position: relative;
`;

const RowBetween = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
`;

const InstructionsLabel = styled.div`
  font-size: 14px;
  text-align: left;
  line-height: 1.5;
`;
