import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X, ChevronDown } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '@theme/text';
import { colors } from '@theme/colors';
import { Overlay } from '@components/modals/Overlay';
import { NetworkRow } from '@components/Send/NetworkRow';
import { networksInfo, ReceiveNetworkType } from '@helpers/types';
import { ZKP2P_SURVEY_FORM_LINK } from "@helpers/docUrls";
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import useAccount from '@hooks/useAccount';
import useSendSettings from '@hooks/useSendSettings';

import baseSvg from '../../assets/images/base.svg';
import sepoliaSvg from '../../assets/images/sepolia.svg';


interface NetworkSelectorProps {
  disabled?: boolean;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  disabled
}) => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Contexts
   */

  const { network } = useAccount();
  const { receiveNetwork, setReceiveNetwork, receiveNetworks } = useSendSettings();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    toggleOpen();
  };

  const handleNetworkContainerClick = () => {
    if (!disabled) {
      toggleOpen();
    }
  };

  const handleSelectPlatform = (network: ReceiveNetworkType) => {
    if (setReceiveNetwork) {
      setReceiveNetwork(network);

      toggleOpen();
    }
  };

  /*
   * Helpers
   */

  const networkSvg = (): string => {
    if (network === 'sepolia') {
      return sepoliaSvg;
    } else {
      if (receiveNetwork) {
        return networksInfo[receiveNetwork].networkSvg;
      } else {
        return baseSvg;
      }
    }
  };

  const networkName = (): string => {
    if (network === 'sepolia') {
      return 'Sepolia';
    } else {
      if (receiveNetwork) {
        return networksInfo[receiveNetwork].networkName;
      } else {
        return 'Loading';
      }
    }
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <NetworkContainer onClick={handleNetworkContainerClick}>
        <NetworkLogoAndNameContainer>
          <NetworkSvg src={networkSvg()} />

          <NetworkNameContainer>
            <NetworkHeader>
              {'To'}
            </NetworkHeader>
            <NetworkNameLabel>
              {networkName()}
            </NetworkNameLabel>
          </NetworkNameContainer>
        </NetworkLogoAndNameContainer>

        <StyledChevronDown/>
      </NetworkContainer>

      {isOpen && (
        <ModalAndOverlayContainer>
          <Overlay onClick={handleOverlayClick}/>

          <ModalContainer>
            <TableHeader>
              <ThemedText.SubHeader style={{ textAlign: 'left' }}>
                Select a network
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
              {receiveNetworks.map((network, index) => (
                <NetworkRow
                  key={index}
                  platformName={networksInfo[network].networkName}
                  flagSvg={networksInfo[network].networkSvg}
                  isSelected={receiveNetwork === network}
                  onRowClick={() => handleSelectPlatform(network)}
                />
              ))}
            </Table>

            <HorizontalDivider/>

            <TableFooter>
              Let us know which networks you are interested in seeing ZKP2P add support
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

const NetworkContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 188px;
  border-radius: 16px;
  border: 1px solid ${colors.defaultBorderColor};
  justify-content: space-between;
  align-items: center;
  background: ${colors.selectorColor};
  padding: 1.1rem 1rem;
  cursor: pointer;

  &:hover {
    background-color: ${colors.selectorHover};
    border: 1px solid ${colors.selectorHoverBorder};
  }
`;

const NetworkLogoAndNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  justify-content: flex-start;
`;

const NetworkNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  justify-content: center;
  text-align: left;
`;

const NetworkHeader = styled.div`
  font-size: 14px;
  color: #CED4DA;
`;

const NetworkNameLabel = styled.div`
  font-size: 16px;
  color: #FFF;
`;

const NetworkSvg = styled.img`
  border-radius: 18px;
  width: 32px;
  height: 32px;
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
