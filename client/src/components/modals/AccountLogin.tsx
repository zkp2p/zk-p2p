import React from "react";
import styled from 'styled-components';
import { ArrowLeft, User, Unlock } from 'react-feather';
import { useLogin, useConnectWallet } from '@privy-io/react-auth';

import { LoginButton } from "@components/common/LoginButton";
import { Overlay } from '@components/modals/Overlay';
import { ThemedText } from '@theme/text'
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

              <StyledArrowLeft/>
            </button>
          </div>

          

          <ThemedText.HeadlineSmall style={{ flex: '1', margin: 'auto', textAlign: 'center' }}>
            {'Log in to ZKP2P'}
          </ThemedText.HeadlineSmall>

          <div style={{ flex: 0.25 }}/>
        </TitleCenteredRow>
        <Logo size={88}>
            <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="logo" />
        </Logo>

        <InputsContainer>
          <LoginButton
            onClick={handleLogin}
            label="Use Email or Google"
            name={`loginEmail`}
            icon={<StyledUser/>}
            value={"Sign in with Social"}
          />
          <HorizontalDivider/>
          <LoginButton
            onClick={handleConnectWallet}
            label="Connect using wallet"
            name={`connectWallet`}
            icon={<StyledUnlock/>}
            value={"Sign in with Ethereum"}
          />
        </InputsContainer>
        <TextAndHelperContainer>
          <ThemedText.BodySmall>
            {'What is the difference? '}
          </ThemedText.BodySmall> 
          <QuestionHelper
            text={"Use a social account if you do not have already have funds on the blockchain. Use an Ethereum wallet if you already have one."}
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
  width: 372px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.25rem;
  background: #0E111C;
  justify-content: space-between;
  align-items: center;
  z-index: 40;
  gap: 1.3rem;
  top: 25%;
  position: relative;
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

const StyledUser = styled(User)`
  color: #FFF;
`;

const StyledUnlock = styled(Unlock)`
  color: #FFF;
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Logo = styled.div<{ size?: number }>`
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.2rem;

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
  width: 100%;
`;