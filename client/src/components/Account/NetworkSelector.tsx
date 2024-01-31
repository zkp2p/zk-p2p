import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '@theme/text';
import { Overlay } from '@components/modals/Overlay';
import { NetworkRow } from '@components/Account/NetworkRow';
import { withdrawNetworks, networksInfo, WithdrawNetworkType } from '@helpers/types';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import { ZKP2P_SURVEY_FORM_LINK } from "../../helpers/docUrls";
// import usePlatformSettings from "@hooks/usePlatformSettings";

import baseSvg from '../../assets/images/base.svg';


export const NetworkSelector: React.FC = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Contexts
   */

  // const { paymentPlatform, setPaymentPlatform } = usePlatformSettings();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    toggleOpen();
  };

  const handleSelectPlatform = (platform: WithdrawNetworkType) => {
    // if (setPaymentPlatform) {
    //   setPaymentPlatform(platform);

    //   toggleOpen();
    // }
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <NetworkLogoAndNameContainer onClick={toggleOpen}>
        <NetworkSvg src={baseSvg} />

        <NetworkNameContainer>
          <ThemedText.LabelSmall>
            {'To'}
          </ThemedText.LabelSmall>
          <ThemedText.BodySmall>
            {'Base'}
          </ThemedText.BodySmall>
        </NetworkNameContainer>
      </NetworkLogoAndNameContainer>

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
              {withdrawNetworks.map((network, index) => (
                <NetworkRow
                  key={index}
                  platformName={networksInfo[network].platformName}
                  platformCurrency={'$'}
                  flagSvg={networksInfo[network].platformSvg}
                  isSelected={false}
                  onRowClick={() => handleSelectPlatform(network)}
                />
              ))}
            </Table>

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

const NetworkLogoAndNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
`;

const NetworkNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  text-align: left;
`;

const NetworkSvg = styled.img`
  width: 32px;
  height: 32px;
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
