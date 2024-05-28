import React from "react";
import styled from 'styled-components';
import { ArrowLeft, Unlock } from 'react-feather';

import { Button } from '@components/common/Button';
import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'
import { colors } from '@theme/colors';

const CHROME_EXTENSION_URL = 'https://chromewebstore.google.com/detail/zkp2p-extension/ijpgccednehjpeclfcllnjjcmiohdjih';

interface ExtensionDataPolicyProps {
  onBackClick: () => void
}

export const ExtensionDataPolicy: React.FC<ExtensionDataPolicyProps> = ({
  onBackClick
}) => {
  /*
   * Contexts
   */

  // Extension context?

  /*
   * Handlers
   */

  const handleInstallExtensionClicked = () => {
    window.open(CHROME_EXTENSION_URL, '_blank');
  };

  const handleOverlayClick = () => {
    onBackClick();
  }


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
            {'Extension Data Policy'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>

        <StyledUnlock />

        <PolicyContainer>
          <PolicyIntro>
            The ZKP2P extension has the following policy:
          </PolicyIntro>
          <PolicyPoints>
            - Storage: None of the data is stored by ZKP2P
          </PolicyPoints>
          <PolicyPoints>
            - Sharing: On integrated websites data is shared with the notary network. All sensitive data is redacted.
          </PolicyPoints>
        </PolicyContainer>

        <Button
          onClick={handleInstallExtensionClicked}
          height={48}
          width={216}
        >
          Proceed
        </Button>
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
  width: 472px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background-color: ${colors.container};
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

const StyledArrowLeft = styled(ArrowLeft)`
  color: #FFF;
`;

const StyledUnlock = styled(Unlock)`
  width: 36px;
  height: 36px;
  color: #FFF;
  padding: 0.5rem 0;
`;

const PolicyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 0 1.75rem;
  color: #FFF;
`;

const PolicyIntro = styled.div`
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
`;

const PolicyPoints = styled.div`
  font-size: 16px;
  text-align: left;
  line-height: 1.5;
`;

const Link = styled.a`
  white-space: pre;
  display: inline-block;
  color: #1F95E2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
