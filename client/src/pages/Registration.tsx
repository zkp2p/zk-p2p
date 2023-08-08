import React from 'react';
import styled from "styled-components";

import { RegistrationForm } from "../components/RegistrationForm"


export const Registration: React.FC<{}> = (props) => {
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
