import React, { useReducer, useRef } from "react";
import styled from 'styled-components';
import { X } from 'react-feather';
import Link from '@mui/material/Link';

import { ThemedText } from '@theme/text';
import { Overlay } from '@components/modals/Overlay';
import { NetworkRow } from '@components/Send/NetworkRow';
import { sendNetworks, networksInfo, SendNetworkType } from '@helpers/types';
import { useOnClickOutside } from '@hooks/useOnClickOutside';
import useAccount from '@hooks/useAccount';
import { ZKP2P_SURVEY_FORM_LINK } from "@helpers/docUrls";
import { commonStrings } from '@helpers/strings';
import QuestionHelper from '@components/common/QuestionHelper';

import baseSvg from '../../assets/images/base.svg';
import sepoliaSvg from '../../assets/images/sepolia.svg';


export const NetworkSelector: React.FC = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)

  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  /*
   * Contexts
   */

  const { network } = useAccount();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    toggleOpen();
  };

  const handleSelectPlatform = (platform: SendNetworkType) => {
    // if (setPaymentPlatform) {
    //   setPaymentPlatform(platform);

    //   toggleOpen();
    // }
  };

  /*
   * Helpers
   */

  const networkSvg = (): string => {
    if (network === 'sepolia') {
      return sepoliaSvg;
    } else {
      return baseSvg;
    }
  };

  const networkName = (): string => {
    if (network === 'sepolia') {
      return 'Sepolia';
    } else {
      return 'Base';
    }
  };

  /*
   * Component
   */

  return (
    <Wrapper ref={ref}>
      <NetworkContainer>
        <NetworkLogoAndNameContainer>
          <NetworkSvg src={networkSvg()} />

          <NetworkNameContainer>
            <ThemedText.LabelSmall>
              {'To'}
            </ThemedText.LabelSmall>
            <ThemedText.Link>
              {networkName()}
            </ThemedText.Link>
          </NetworkNameContainer>
        </NetworkLogoAndNameContainer>

        <QuestionHelperContainer>
          <QuestionHelper
            text={commonStrings.get('SEND_MODAL_TOOLTIP')}
            size={'medium'}
          />
        </QuestionHelperContainer>
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
              {sendNetworks.map((network, index) => (
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

const NetworkContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 188px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  justify-content: space-between;
  align-items: center;
  background: #0E111C;
  padding: 1rem;
`;

const NetworkLogoAndNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  justify-content: flex-start;
`;

const QuestionHelperContainer = styled.div`
  display: flex;
  align-items: center;
  padding-right: 1.25rem;
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
