import React, { Suspense } from 'react';
import styled from 'styled-components/macro';
import QRCode from "react-qr-code";
import { X, Copy } from 'react-feather';
import { ENSName, AddressDisplayEnum } from 'react-ens-name';

import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'
import useAccount from '@hooks/useAccount';
import useModal from '@hooks/useModal';
import { commonStrings } from '@helpers/strings';
import { alchemyMainnetEthersProvider } from "index";

import baseSvg from '../../assets/images/base.svg';


export default function DepositModal() {
  /*
   * Contexts
   */

  const { closeModal } = useModal();
  const { loggedInEthereumAddress } = useAccount();

  /*
   * Handlers
   */

  const handleCloseModal = () => {
    closeModal();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  };

  const handleCopyClick = () => {
    if (loggedInEthereumAddress) {
      copyToClipboard(loggedInEthereumAddress);
    }
  };

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay onClick={handleCloseModal} />

      <Suspense>
        <ModalContainer>
          <TitleCenteredRow>
            <div style={{ flex: 0.25 }}>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >

                <StyledX/>
              </button>
            </div>

            <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
              {'Deposit'}
            </ThemedText.HeadlineSmall>

            <div style={{ flex: 0.25 }}/>
          </TitleCenteredRow>

          <QRContainer>
            <QRCode
              value={`ethereum:${loggedInEthereumAddress}`}
              size={192}/>
          </QRContainer>

          <AccountAddressContainer>
            <AddressAndEnsNameContainer>
              <ThemedText.LabelSmall style={{ textAlign: 'left', color: '#FFF' }}>
                Base Address (Ethereum)
              </ThemedText.LabelSmall>

              <AddressLabel>
                <ENSName
                  provider={alchemyMainnetEthersProvider}
                  address={loggedInEthereumAddress || ''}
                  displayType={AddressDisplayEnum.FULL}
                />
              </AddressLabel>
            </AddressAndEnsNameContainer>

            <IconBorder>
              <StyledCopy onClick={handleCopyClick} />
            </IconBorder>
          </AccountAddressContainer>

          <InstructionsContainer>
            <NetworkSvg src={baseSvg} />

            <InstructionsLabel>
              { commonStrings.get('DEPOSIT_FUNDS_INSTRUCTIONS') }
            </InstructionsLabel>
          </InstructionsContainer>
        </ModalContainer>
      </Suspense>
    </ModalAndOverlayContainer>
  );
}

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
  width: 440px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0D111C;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  gap: 1.3rem;
  
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const TitleCenteredRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  color: #FFF;
`;

const StyledX = styled(X)`
  color: #FFF;
`;

const StyledCopy = styled(Copy)`
  color: #FFF;
  height: 18px;
  width: 18px;
  cursor: pointer;
`;

const IconBorder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 50%;
  background-color: #3A3D44;

  &:hover {
    background-color: #4A4D54;
  }
`;

const QRContainer = styled.div`
  padding: 1.4rem 1.5rem 1.2rem;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  background: #131A2A;
`;

const AccountAddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 1.5rem;
  text-align: left;
`;

const AddressAndEnsNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  color: #9ca3af;
  gap: 1rem;
`;

const AddressLabel = styled.div`
  max-width: calc(100% - 32px);
  word-break: break-all;
  line-height: 1.4;
`;

const NetworkSvg = styled.img`
  width: 32px;
  height: 32px;
`;

const InstructionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid #98a1c03d;
  border-radius: 16px;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  color: #FFF;
`;

const InstructionsLabel = styled.div`
  font-size: 15px;
  line-height: 1.5;
  text-align: left;
`;
