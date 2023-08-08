import React from 'react';
import styled from "styled-components";

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
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

