import React, { useEffect } from 'react';
import styled from "styled-components";

import { RegistrationForm } from "@components/RegistrationForm"
import useRegistration from '@hooks/useRegistration';


export const Registration: React.FC<{}> = (props) => {
  /*
   * Contexts
   */

  const { refetchRampAccount, shouldFetchRegistration } = useRegistration();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchRegistration) {
      refetchRampAccount?.();
    }
  }, []);

  return (
    <PageWrapper>
      <Main>
        <RegistrationForm />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
