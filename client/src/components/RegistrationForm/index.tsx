import React, { useState } from 'react';
import styled from 'styled-components/macro'

import { ExistingRegistration } from "./ExistingRegistration";
import { NewRegistration } from "./NewRegistration";
import useAccount from '@hooks/useAccount'

 
export const RegistrationForm: React.FC = () => {
  /*
   * Context
   */
  const { loggedInEthereumAddress } = useAccount()

  /*
   * State
   */
  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(false);

  /*
   * Handlers
   */
  const handleUpdateClick = () => {
    setIsNewRegistration(true);
  }

  const handleBackClick = () => {
    setIsNewRegistration(false);
  }

  /*
    Component
  */
  return (
    <Wrapper>
      {!isNewRegistration ? (
        <ExistingRegistration
          loggedInWalletAddress={loggedInEthereumAddress}
          handleNewRegistrationClick={handleUpdateClick}
        />
      ) : (
        <NewRegistration
          handleBackClick={handleBackClick}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 660px;
  width: 100%;
  padding-top: 1.5rem;
`;
