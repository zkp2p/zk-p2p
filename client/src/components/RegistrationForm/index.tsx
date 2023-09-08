import React, { useState } from 'react';
import styled from 'styled-components/macro'

import { ExistingRegistration } from "./ExistingRegistration";
import { NewRegistration } from "./NewRegistration";

 
export const RegistrationForm: React.FC = () => {
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
