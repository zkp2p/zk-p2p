import React from "react";
import styled from 'styled-components';
import { ArrowLeft, Unlock } from 'react-feather';

import { Button } from '@components/common/Button';
import { Overlay } from '@components/modals/Overlay';
import { RequirementStepRow } from "@components/modals/RequirementStepRow";
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

  const handleCodeReviewClicked = () => {
    window.open("https://github.com/zkp2p/zk-p2p-extension", '_blank');
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
          <RequirementStepRow>
            The ZKP2P extension stores or shares data in the following ways:
          </RequirementStepRow>
          <RequirementStepRow step={1}>
            <b>Storage</b>: <u>No data</u> accessible by the extension is stored by ZKP2P
          </RequirementStepRow>
          <RequirementStepRow step={2}>
            <b>Sharing</b>: On integrated websites public data is shared with the notary network. <u>All sensitive data is redacted.</u>
          </RequirementStepRow>
          <RequirementStepRow>
            All code for this extension is open source and can be reviewed <Link href="https://github.com/zkp2p/zk-p2p-extension" target = "_blank" rel = "noopener noreferrer">here</Link>.
          </RequirementStepRow>
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
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
