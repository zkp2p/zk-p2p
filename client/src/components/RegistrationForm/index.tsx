import { useAccount } from "wagmi";
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro'

import { ExistingRegistration } from "./ExistingRegistration";
import { NewRegistrationProof } from "./NewRegistrationProof";
import { NewRegistrationSubmit } from "./NewRegistrationSubmit";

 
export const RegistrationForm: React.FC = () => {
  const { address } = useAccount();

  /*
    State
  */

  const [ethereumAddress, setEthereumAddress] = useState<string>(address ?? "");
  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(false);

  const handleUpdateClick = () => {
    setIsNewRegistration(true);
  }

  const handleBackClick = () => {
    setIsNewRegistration(false);
  }

  // ----- transaction state -----
  const [submitOrderPublicSignals, setSubmitOrderPublicSignals] = useState<string>('');
  const [submitOrderProof, setSubmitOrderProof] = useState<string>('');

  /*
    Hooks
  */

  useEffect(() => {
    if (address) {
      setEthereumAddress(address);
    } else {
      setEthereumAddress("");
    }
  }, [address]);

  /*
    Component
  */
  return (
    <Wrapper>
      <Column>
        <Content>
          {!isNewRegistration ? (
            <ExistingRegistration
              loggedInWalletAddress={ethereumAddress}
              handleNewRegistrationClick={handleUpdateClick}
            />
          ) : (
            <NewRegistrationContainer>
              <Column>
                <NewRegistrationProof
                  loggedInWalletAddress={'0x123'}
                  setSubmitOrderProof={setSubmitOrderProof}
                  setSubmitOrderPublicSignals={setSubmitOrderPublicSignals}
                  handleBackClick={handleBackClick}
                />
              </Column>
              <Column>
                <NewRegistrationSubmit
                  proof={submitOrderProof}
                  publicSignals={submitOrderPublicSignals}
                />
              </Column>
            </NewRegistrationContainer>
          )}
        </Content>
      </Column>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 660px;
  width: 100%;
  padding-top: 1.5rem;
`;

const Column = styled.div`
  gap: 1rem;
  align-self: flex-start;
  border-radius: 16px;
  justify-content: center;
`;

const Content = styled.div`
  gap: 1rem;
  align-self: flex-start;
`;

const NewRegistrationContainer = styled.div`
  display: grid;
  padding: 1.5rem;
  background-color: #0D111C;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;
