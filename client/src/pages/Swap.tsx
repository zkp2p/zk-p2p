import React, { useState } from 'react';
import styled from "styled-components";

import SwapModal from "../components/Swap"


export const Swap: React.FC<{}> = (props) => {

  return (
    <PageWrapper>
      <Main>
        <SwapModal />
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

