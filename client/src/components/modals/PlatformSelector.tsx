import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X, ChevronDown } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Overlay } from '@components/modals/Overlay';
import { PlatformRow } from '@components/modals/PlatformRow';
import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { paymentPlatforms, paymentPlatformInfo, PaymentPlatformType } from '@helpers/types';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { ZKP2P_SURVEY_FORM_LINK } from "../../helpers/docUrls";
import usePlatformSettings from "@hooks/usePlatformSettings";


export const PlatformSelector: React.FC<{ onlyDisplayPlatform: boolean }> = ({ onlyDisplayPlatform = false }) => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Contexts
   */

  const { paymentPlatform, setPaymentPlatform, currencyIndex, setCurrencyIndex } = usePlatformSettings();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    toggleOpen();
  };

  const handleSelectPlatform = (platform: PaymentPlatformType, currencyIndex: number) => {
    if (setPaymentPlatform && setCurrencyIndex) {
      setPaymentPlatform(platform);
      setCurrencyIndex(currencyIndex);

      toggleOpen();
    }
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <PlatformNameAndChevronContainer onClick={toggleOpen} onlyDisplayPlatform={onlyDisplayPlatform}>
        { !onlyDisplayPlatform 
          && <SVGIconThemed icon={paymentPlatformInfo[paymentPlatform as PaymentPlatformType].platformCurrencyIcons[currencyIndex ?? 0]} width={'24'} height={'24'}/> 
        }
        <PlatformLabel>
          { onlyDisplayPlatform
            ? paymentPlatformInfo[paymentPlatform as PaymentPlatformType].platformName
            : paymentPlatformInfo[paymentPlatform as PaymentPlatformType].platformCurrencies[currencyIndex ?? 0]
          }
        </PlatformLabel>
        <StyledChevronDown/>
      </PlatformNameAndChevronContainer>

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
              { onlyDisplayPlatform
                ? paymentPlatforms.map((platform, index) => (
                  <PlatformRow
                    key={`${index}`}
                    platformName={paymentPlatformInfo[platform].platformName}
                    platformCurrency=''
                    flagSvg={paymentPlatformInfo[platform].flagSvgs[0]} // TODO: what svg to use here?
                    isSelected={paymentPlatform === platform}
                    onlyDisplayPlatform={onlyDisplayPlatform}
                    onRowClick={() => handleSelectPlatform(platform, 0)}
                  />
                ))
                : paymentPlatforms.map((platform, index) => 
                  paymentPlatformInfo[platform].platformCurrencies.map((currency, currIndex) => (
                    <PlatformRow
                      key={`${index}-${currIndex}`}
                      platformName={paymentPlatformInfo[platform].platformName}
                      platformCurrency={currency}
                      flagSvg={paymentPlatformInfo[platform].flagSvgs[currIndex]}
                      isSelected={paymentPlatform === platform && currencyIndex === currIndex}
                      onlyDisplayPlatform={onlyDisplayPlatform}
                      onRowClick={() => handleSelectPlatform(platform, currIndex)}
                    />
                  ))
              )}
            </Table>

            <HorizontalDivider/>

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

const PlatformNameAndChevronContainer = styled.div<{ onlyDisplayPlatform: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 24px;
  background: ${colors.selectorColor};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: ${({ onlyDisplayPlatform }) => onlyDisplayPlatform ? '6px 8px 6px 14px': '4px 6px 4px 4px'};
  gap: ${({ onlyDisplayPlatform }) => onlyDisplayPlatform ? '4px' : '6px'};
  cursor: pointer;

  &:hover {
    background-color: ${colors.selectorHover};
    border: 1px solid ${colors.selectorHoverBorder};
  }
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
  background-color: ${colors.container};
  color: #FFF;
  align-items: center;
  z-index: 20;
  
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
  border-top: 1px solid ${colors.defaultBorderColor};
`;

const StyledX = styled(X)`
  color: #FFF;
`;

const Table = styled.div`
  width: 100%;
  color: #616161;
  height: 284px;

  overflow-y: auto;
  scrollbar-width: thin;
`;

const TableFooter = styled.div`
  padding: 20px;
  font-size: 14px;
  text-align: left;
  line-height: 1.5;
`;
