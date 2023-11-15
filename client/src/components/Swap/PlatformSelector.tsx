import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X, ChevronDown } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '../../theme/text'
import { Overlay } from '@components/modals/Overlay';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import venmoLogo from '../../assets/images/venmo_logo.png';


export const PlatformSelector: React.FC = () => {
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
        <Logo src={venmoLogo} alt="Venmo" />
        <StyledChevronDown/>
      </LogoAndTokenLabel>

      {isOpen && (
        <ModalAndOverlayContainer>
          <Overlay onClick={handleOverlayClick}/>

          <ModalContainer>
            <RowBetween>
              <ThemedText.SubHeader style={{ textAlign: 'left' }}>
                Select a Platform
              </ThemedText.SubHeader>

              <button
                onClick={handleOverlayClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <StyledX/>
              </button>
            </RowBetween>

            <InstructionsLabel>
              We currently only support Venmo, but are expanding to other platforms. Please let us know which platforms
              you are interested in seeing ZKP2P add support for. <Link href="https://docs.zkp2p.xyz/zkp2p/user-guides/on-ramping" target="_blank">
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
  padding: 6px 8px 6px 14px;
  gap: 4px;
`;

const Logo = styled.img`
  width: 64px;
  padding-top: 1px;
  height: auto;
`;

const StyledChevronDown = styled(ChevronDown)`
  width: 20px;
  height: 20px;
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

const StyledX = styled(X)`
  color: #FFF;
`;

const InstructionsLabel = styled.div`
  font-size: 14px;
  text-align: left;
  line-height: 1.5;
`;
