import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X, ChevronDown } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '@theme/text';
import { Overlay } from '@components/modals/Overlay';
import { PlatformRow } from '@components/modals/PlatformRow';
import { paymentPlatforms, paymentPlatformInfo, PaymentPlatformType } from '@helpers/types';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { ZKP2P_SURVEY_FORM_LINK } from "../../helpers/docUrls";
import usePlatformSettings from "@hooks/usePlatformSettings";


export const PlatformSelector: React.FC = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Contexts
   */

  const { paymentPlatform, setPaymentPlatform } = usePlatformSettings();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    toggleOpen();
  };

  const handleSelectPlatform = (platform: PaymentPlatformType) => {
    if (setPaymentPlatform) {
      setPaymentPlatform(platform);

      toggleOpen();
    }
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <LogoAndTokenLabel onClick={toggleOpen}>
        <PlatformLabel>
          {paymentPlatformInfo[paymentPlatform as PaymentPlatformType].platformName}
        </PlatformLabel>
        <StyledChevronDown/>
      </LogoAndTokenLabel>

      {isOpen && (
        <ModalAndOverlayContainer>
          <Overlay onClick={handleOverlayClick}/>

          <ModalContainer>
            <TableHeader>
              <ThemedText.SubHeader style={{ textAlign: 'left' }}>
                Select a platform
              </ThemedText.SubHeader>

              <button
                onClick={handleOverlayClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <StyledX/>
              </button>
            </TableHeader>

            <HorizontalDivider/>

            <Table>
              {paymentPlatforms.map((platform, index) => (
                <PlatformRow
                  key={index}
                  platformName={paymentPlatformInfo[platform].platformName}
                  platformCurrency={paymentPlatformInfo[platform].platformCurrency}
                  flagSvg={paymentPlatformInfo[platform].flagSvg}
                  isSelected={paymentPlatform === platform}
                  onRowClick={() => handleSelectPlatform(platform)}
                />
              ))}
            </Table>

            <TableFooter>
              Let us know which platforms you are interested in seeing ZKP2P add support
              for. <Link href={ ZKP2P_SURVEY_FORM_LINK } target="_blank">
                Give feedback ↗
              </Link>
            </TableFooter>
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

const PlatformLabel = styled.div`
  color: #FFF;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 1px 5px 0px 5px;
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
  background: #0D111C;
  color: #FFF;
  align-items: center;
  z-index: 20;
  top: 33%;
  position: relative;
`;

const TableHeader = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 16px 20px;
`;

const HorizontalDivider = styled.div`
  width: 100%;
  border-top: 1px solid #98a1c03d;
`;

const StyledX = styled(X)`
  color: #FFF;
`;

const Table = styled.div`
  width: 100%;
  color: #616161;
`;

const TableFooter = styled.div`
  padding: 20px;
  font-size: 14px;
  text-align: left;
  line-height: 1.5;
`;
