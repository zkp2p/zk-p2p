import React, { useEffect } from 'react';
import styled from "styled-components";

import SendForm from "@components/Send";
import useBalances from '@hooks/useBalance';


export const Send: React.FC = () => {
  /*
   * Contexts
   */

  const { refetchUsdcBalance, shouldFetchUsdcBalance } = useBalances();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchUsdcBalance) {
      refetchUsdcBalance?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper>
      <Main>
        <SendForm />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;
  padding-bottom: 3rem;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
