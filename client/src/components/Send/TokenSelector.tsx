import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X, ChevronDown } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Overlay } from '@components/modals/Overlay';
import { TokenRow } from '@components/Send/TokenRow';
import {
  baseUSDCTokenData,
  receiveTokenData,
  networkSupportedTokens,
  ReceiveTokenType,
  ReceiveTokenData,
} from '@helpers/types';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { ZKP2P_SURVEY_FORM_LINK } from "../../helpers/docUrls";
import useSendSettings from "@hooks/useSendSettings";


export const TokenSelector: React.FC = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Contexts
   */

  const { receiveNetwork, ReceiveNetwork, receiveToken, setReceiveToken } = useSendSettings();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    toggleOpen();
  };

  const handleSelectToken = (receiveToken: ReceiveTokenType) => {
    if (setReceiveToken) {
      setReceiveToken(receiveToken);

      toggleOpen();
    }
  };

  /*
   * Helpers
   */

  const selectedReceiveToken = (): ReceiveTokenData => {
    if (receiveTokenData && receiveToken && receiveNetwork) {
      const selectedReceiveTokenData = receiveTokenData[receiveNetwork][receiveToken];

      if (!selectedReceiveTokenData) {
        return baseUSDCTokenData;
      } else {
        return selectedReceiveTokenData;
      }
    } else {
      return baseUSDCTokenData;
    }
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <LogoAndTokenLabel onClick={toggleOpen}>
        <NetworkSvg src={selectedReceiveToken().logoURI} />

        <TokenLabel>
          {selectedReceiveToken().symbol}
        </TokenLabel>
        <StyledChevronDown/>
      </LogoAndTokenLabel>

      {isOpen && (
        <ModalAndOverlayContainer>
          <Overlay onClick={handleOverlayClick}/>

          <ModalContainer>
            <TableHeader>
              <ThemedText.SubHeader style={{ textAlign: 'left' }}>
                Select a token
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
              {networkSupportedTokens[receiveNetwork ?? ReceiveNetwork.ETHEREUM].map((tokenType, index) => {
                const tokenData = receiveTokenData[receiveNetwork ?? ReceiveNetwork.ETHEREUM][tokenType];

                const receiveTokenName = tokenData?.name ?? 'USD Coin';
                const receiveTokenSymbol = tokenData?.symbol ?? 'USDC';
                const tokenSvg = tokenData?.logoURI ?? '';
                const isSelected = receiveToken === tokenType;

                return (
                  <TokenRow
                    key={index}
                    receiveTokenName={receiveTokenName}
                    receiveTokenSymbol={receiveTokenSymbol}
                    tokenSvg={tokenSvg}
                    isSelected={isSelected}
                    onRowClick={() => handleSelectToken(tokenType)}
                  />
                );
              })}
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

const LogoAndTokenLabel = styled.div`
  width: 98px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 24px;
  background: ${colors.selectorColor};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 8px 4px 4px;
  gap: 6px;
  cursor: pointer;

  &:hover {
    background-color: ${colors.selectorHover};
  }
`;

const NetworkSvg = styled.img`
  border-radius: 18px;
  width: 24px;
  height: 24px;
`;

const TokenLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #FFF;
  padding-top: 3px;
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
