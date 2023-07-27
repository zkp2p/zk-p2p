import React, { useState } from 'react';
import styled from "styled-components";

import { Toggle } from "../components/Toggle";
import PoolTable from "../components/Pool"


export const Pool: React.FC<{}> = (props) => {

  return (
    <PageWrapper>
      <Main>
        <PoolTable />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;

  & .title {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  & .main {
    & .signaturePane {
      flex: 1;
      display: flex;
      flex-direction: column;
      & > :first-child {
        height: calc(30vh + 24px);
      }
    }
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

