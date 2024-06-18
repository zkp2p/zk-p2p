import React from 'react';
import styled from 'styled-components';
import { X } from 'react-feather';
import { ENSName, AddressDisplayEnum } from 'react-ens-name';

import { Button } from '@components/common/Button';
import { Overlay } from '@components/modals/Overlay';
import { CopyButton } from '@components/common/CopyButton';
import { ThemedText } from '@theme/text';
import { ReceiveNetwork, ReceiveNetworkType, networksInfo } from '@helpers/types';
import { colors } from '@theme/colors';
import useQuery from '@hooks/useQuery';
import { alchemyMainnetEthersProvider } from 'index';


interface IntegrationProps {
  onBackClick: () => void
}

export const Integration: React.FC<IntegrationProps> = ({
  onBackClick,
}) => {
  /*
   * Contexts
   */

  const { queryParams } = useQuery();

  /*
   * Handlers
   */

  const handleOverlayClick = () => {
    onBackClick();
  }

  /*
   * Helpers
   */

  const networkName = (): string => {
    const networkFromQuery = queryParams.NETWORK;
    const isValidNetworkFromQuery = Object.values(ReceiveNetwork).includes(networkFromQuery as ReceiveNetworkType);
    if (!isValidNetworkFromQuery) {
      return 'Invalid Network';
    };

    const receiveNetwork = networksInfo[networkFromQuery as ReceiveNetworkType];
    const vmString = receiveNetwork.networkId === ReceiveNetwork.SOLANA ? '' : ' (Ethereum)';
    return `${receiveNetwork.networkName} Address ${vmString}`;
  };

  const instructionCopy = (): string => {
    const appIdFromQuery = queryParams.APP_ID;
    const appCopy = appIdFromQuery ? `You've arrived from ${appIdFromQuery}` : '';

    const toTokenFromQuery = queryParams.TO_TOKEN;
    const networkFromQuery = queryParams.NETWORK;
    const isToTokenUsdc = toTokenFromQuery === 'USDC'
    const isNetworkBase = networkFromQuery === 'base';
    const flowCopy = (isNetworkBase && isToTokenUsdc) ? 'Swap flow' : 'Swap and Send flows';

    const amountUsdcFromQuery = queryParams.AMOUNT_USDC;
    let amountCopy = `${toTokenFromQuery}`;
    if (amountUsdcFromQuery && isToTokenUsdc) {
      amountCopy = `${amountUsdcFromQuery} ${toTokenFromQuery}`;
    }

    return `${appCopy}. Complete the ${flowCopy} to receive ${amountCopy} directly to the following wallet address:`
  };
  
  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay />

      <ModalContainer>
        <TitleCenteredRow>
          <div style={{ flex: 0.25 }}>
            <button
              onClick={handleOverlayClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >

              <StyledArrowLeft/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            Welcome to ZKP2P
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <Logo size={92}>
          <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
        </Logo>

        <InstructionAndAddressContainer>
          <InstructionsContainer>
            <ThemedText.SubHeader style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
              { instructionCopy()}
            </ThemedText.SubHeader>
          </InstructionsContainer>

          <AccountAddressContainer>
            <AddressAndEnsNameContainer>
              <ThemedText.LabelSmall style={{ textAlign: 'left', color: '#FFF' }}>
                {networkName()}
              </ThemedText.LabelSmall>

              <AddressLabel>
                {queryParams.NETWORK === 'solana' ? (
                  <SolanaAddressLabel>
                    { queryParams.RECIPIENT_ADDRESS }
                  </SolanaAddressLabel>
                ) : (
                  <ENSName
                    provider={alchemyMainnetEthersProvider}
                    address={queryParams.RECIPIENT_ADDRESS || ''}
                    displayType={AddressDisplayEnum.FULL}
                  />
                )}
              </AddressLabel>
            </AddressAndEnsNameContainer>

            <CopyButton textToCopy={queryParams.RECIPIENT_ADDRESS || ''} />
          </AccountAddressContainer>

          <Button
            onClick={onBackClick}
            width={164}
          >
            Continue
          </Button>
        </InstructionAndAddressContainer>
      </ModalContainer>
    </ModalAndOverlayContainer>
  );
};

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
  width: 80vw;
  max-width: 392px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background-color: ${colors.container};
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  gap: 1.75rem;
  
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

const StyledArrowLeft = styled(X)`
  color: #FFF;
`;

const Logo = styled.div<{ size?: number }>`
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-decoration: none;

  img {
    width: ${({ size }) => size || 32}px;
    height: ${({ size }) => size || 32}px;
    object-fit: cover;
  }
`;

const InstructionAndAddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  color: #FFF;
`;

const InstructionsContainer = styled.div`
  padding: 0 1.25rem;
`;

const AccountAddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: left;
`;

const AddressAndEnsNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  color: #9ca3af;
  gap: 1rem;
`;

const SolanaAddressLabel = styled.div`
  max-width: calc(100% - 16px);
  font-size: 16px;
  word-break: break-all;
  line-height: 1.4;
`;

const AddressLabel = styled.div`
  max-width: calc(100% - 16px);
  font-size: 16px;
  word-break: break-all;
  line-height: 1.4;
`;
