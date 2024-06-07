import { useRef, useReducer } from 'react';
import { MoreHorizontal } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import styled from "styled-components";

import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { CLIENT_VERSION } from '@helpers/constants';
import { ThemedText } from '@theme/text';
import useMediaQuery from "@hooks/useMediaQuery";


export const MenuDropdown = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation();
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)
  const isMobile = useMediaQuery() === 'mobile';

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
    <Wrapper isMobile={isMobile} ref={ref}>
      <NavButton onClick={toggleOpen}>
        <StyledMoreHorizontal />
      </NavButton>

      {isOpen && (
        <NavDropdown isMobile={isMobile}>
          <NavDropdownItemContainer>
            {isMobile && (
              <NavDropdownItem as={Link} to="/deposits" onClick={toggleOpen}>
                <ThemedText.LabelSmall textAlign="left">
                  Deposit
                </ThemedText.LabelSmall>
              </NavDropdownItem>
            )}

            <NavDropdownItem as={Link} to={"/withdraw" + location.search} onClick={toggleOpen}>
              <ThemedText.LabelSmall textAlign="left">
                Withdraw
              </ThemedText.LabelSmall>
            </NavDropdownItem>

            <NavDropdownItem as={Link} to={"/tos" + location.search} onClick={toggleOpen}>
              <ThemedText.LabelSmall textAlign="left">
                Terms of Service
              </ThemedText.LabelSmall>
            </NavDropdownItem>

            <NavDropdownItem as={Link} to={"/pp" + location.search} onClick={toggleOpen}>
              <ThemedText.LabelSmall textAlign="left">
                Privacy Policy
              </ThemedText.LabelSmall>
            </NavDropdownItem>
          </NavDropdownItemContainer>

          <NavDropdownItem
            href="https://dune.com/zkp2p/zkp2p"
            target="_blank"
            rel="noopener noreferrer">
              <ThemedText.LabelSmall textAlign="left">
                Analytics ↗
              </ThemedText.LabelSmall>
          </NavDropdownItem>

          <NavDropdownItem
            href="https://docs.zkp2p.xyz/zkp2p/"
            target="_blank"
            rel="noopener noreferrer">
              <ThemedText.LabelSmall textAlign="left">
                Documentation ↗
              </ThemedText.LabelSmall>
          </NavDropdownItem>
          
          <NavDropdownItem
            href="https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih"
            target="_blank"
            rel="noopener noreferrer">
              <ThemedText.LabelSmall textAlign="left">
                Browser Extension ↗
              </ThemedText.LabelSmall>
          </NavDropdownItem>

          <NavDropdownItem
              href="https://v1.zkp2p.xyz/"
              target="_blank"
              rel="noopener noreferrer">
                <ThemedText.LabelSmall textAlign="left">
                  ZKP2P V1 PoC ↗
                </ThemedText.LabelSmall>
            </NavDropdownItem>

          <IconRow>
            <Icon
              icon={'twitter'}
              onClick={() => jumpToMedia('https://twitter.com/zkp2p')}
            />

            <Icon
              icon={'github'}
              onClick={() => jumpToMedia('https://github.com/zkp2p')}
            />

            <Icon
              icon={'telegram'}
              onClick={() => jumpToMedia('https://t.me/+XDj9FNnW-xs5ODNl')}
            />

            <VersionLabel>
              v{CLIENT_VERSION}
            </VersionLabel>
          </IconRow>
        </NavDropdown>
      )}
    </Wrapper>
  )
};

const Wrapper = styled.div<{isMobile?: boolean}>`
  display: flex;
  ${({ isMobile }) => isMobile ? '' : 'flex-direction: column'};
  ${({ isMobile }) => isMobile ? '' : 'align-items: flex-start'};
  position: relative;
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

const NavDropdown = styled.div<{isMobile?: boolean}>`
  display: flex;
  flex-direction: column;
  width: 176px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.75rem 1.5rem;
  background: #1B1B1B;
  z-index: 20;
  gap: 0.75rem;
  color: #FFFFFF;

  position: absolute;
  ${({ isMobile }) => isMobile ? `
    bottom: calc(100% + 28px);
    top: auto;
    right: -20px;
  ` : `
    top: calc(100% + 20px);
    right: 0;
  `}
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
