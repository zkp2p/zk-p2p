import { useRef, useReducer } from 'react';
import { MoreHorizontal, ChevronDown } from 'react-feather';
import { Link } from 'react-router-dom';
import styled from "styled-components";

import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { ThemedText } from '@theme/text';


export const LoginDropdown = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Handler
   */

  const jumpToMedia = (url: string) => {
    window.open(url, '_blank');
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <NavButton onClick={toggleOpen}>
        <StyledMoreHorizontal />
      </NavButton>

      {isOpen && (
        <NavDropdown>
          <NavDropdownItemContainer>
            <NavDropdownItem as={Link} to="/withdraw">
              <ThemedText.LabelSmall textAlign="left">
                Sign in With Social
              </ThemedText.LabelSmall>
            </NavDropdownItem>

            <NavDropdownItem as={Link} to="/tos">
              <ThemedText.LabelSmall textAlign="left">
                Sign in with Ethereum
              </ThemedText.LabelSmall>
            </NavDropdownItem>
          </NavDropdownItemContainer>
        </NavDropdown>
      )}
    </Wrapper>
  )
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: flex-start;
`;

const StyledMoreHorizontal = styled(MoreHorizontal)`
  color: #FFF;
  width: 24px;
  height: 24px;
`;

const NavButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding-right: 8px;
`;

const NavDropdown = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.75rem 1.5rem;
  background: #1B1B1B;
  position: absolute;
  top: calc(100% + 20px);
  right: 0;
  z-index: 20;
  gap: 0.75rem;
  color: #FFFFFF;
`;

const NavDropdownItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  white-space: nowrap;
`;

const NavDropdownItem = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.5rem;
  align-items: center;
`;

const Icon = styled(SVGIconThemed)`
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.6;
  }
`;

const VersionLabel = styled.div`
  font-size: 14px;
  color: #FFFFFF;
  opacity: 0.3;
  text-align: left;
`;
