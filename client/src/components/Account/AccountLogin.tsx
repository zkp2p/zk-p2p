import React from "react";
import styled from 'styled-components';
import { X, User, Unlock } from 'react-feather';
import { useLogin, useConnectWallet } from '@privy-io/react-auth';

import { LoginTypeButton } from "@components/Account/LoginTypeButton";
import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'
import { commonStrings } from '@helpers/strings';
import QuestionHelper from '@components/common/QuestionHelper';


interface AccountLoginProps {
  onBackClick: () => void
}

export const AccountLogin: React.FC<AccountLoginProps> = ({
    onBackClick
  }) => {
  /*
   * Contexts
   */

  const { login } = useLogin({
    onComplete: () => {
      onBackClick();
    }
  });
  
  const { connectWallet } = useConnectWallet({
    onSuccess: () => {
      onBackClick();
    }
  });
  
  /*
  * Handlers
  */
  const handleOverlayClick = () => {
    onBackClick();
  }

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Failed to login");
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet");
    }
  };

  /*
   * Component
   */

  return (
    <ModalAndOverlayContainer>
      <Overlay onClick={handleOverlayClick} />

      <ModalContainer>
        <TitleCenteredRow>
          <div style={{ flex: 0.25 }}>
            <button
              onClick={handleOverlayClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >

              <StyledX/>
            </button>
          </div>

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            {'Log In'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>
        
        <Logo size={80}>
          <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
        </Logo>

        <InputsContainer>
          <LoginTypeButton
            onClick={handleLogin}
            label="Use Email or Google"
            icon={<StyledUser/>}
            value={"Sign in with Social"}
          />

          <HorizontalDivider/>

          <LoginTypeButton
            onClick={handleConnectWallet}
            label="Connect using wallet"
            icon={<StyledUnlock/>}
            value={"Sign in with Ethereum"}
          />
        </InputsContainer>
        <TextAndHelperContainer>
          <ThemedText.BodySmall>
            {'What is the difference? '}
          </ThemedText.BodySmall> 
          <QuestionHelper
            text={commonStrings.get('LOGIN_MODAL_TOOLTIP')}
          />
        </TextAndHelperContainer>
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
  z-index: 30;
`;

const ModalContainer = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0E111C;
  justify-content: space-between;
  align-items: center;
  z-index: 40;
  
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
  color: #FFF;
`;

const StyledX = styled(X)`
  color: #FFF;
`;

const StyledUser = styled(User)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const StyledUnlock = styled(Unlock)`
  color: #FFF;
  height: 18px;
  width: 18px;
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div<{ size?: number }>`
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.2rem;
  padding: 1.75rem 0rem;

  img {
    width: ${({ size }) => size || 32}px;
    height: ${({ size }) => size || 32}px;
    object-fit: cover;
  }
`;

const HorizontalDivider = styled.div`
  width: 100%;
  border-top: 1px solid #98a1c03d;
  margin: 1rem 0;
`;

const TextAndHelperContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding-top: 1rem;
`;
