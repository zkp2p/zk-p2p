import React, { useState } from 'react';
import styled from 'styled-components/macro'

import { ExistingRegistration } from "./ExistingRegistration";
import { NewRegistration } from "./NewRegistration";
import AccountContext from '../../contexts/Account/AccountContext';

 
export const RegistrationForm: React.FC = () => {
  /*
   * Context
   */
  const { ethereumAddress } = React.useContext(AccountContext);

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
          loggedInWalletAddress={ethereumAddress}
          handleNewRegistrationClick={handleUpdateClick}
        />
      ) : (
        <NewRegistration
          loggedInWalletAddress={ethereumAddress}
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
