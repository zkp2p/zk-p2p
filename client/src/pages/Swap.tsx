import React, { useState } from 'react';
import styled from "styled-components";

import { Toggle } from "../components/Toggle";
import Pool from "../components/Pool"
import SwapModal from "../components/Swap"


export const Swap: React.FC<{}> = (props) => {
  const [isSwapTab, setIsSwapTab] = useState(true);

  const togglePressed = (target: string) => {
    const tab = (typeof target === 'string' && target) || 'Swap';
    setIsSwapTab(tab === 'Swap');
  };

  return (
    <PageWrapper>
      <Main>
        <Toggle handleToggle={togglePressed} isSwapTab={isSwapTab} />
          {isSwapTab ? <SwapModal /> : <Pool />}
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

