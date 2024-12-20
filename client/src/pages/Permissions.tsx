import React, { useEffect } from 'react';
import styled from "styled-components";

import PermissionsForm from "@components/Permissions"
import usePermissions from "@hooks/usePermissions";


export const Permissions: React.FC = () => {
  /*
   * Contexts
   */

  const { refetchDeniedUsers, shouldFetchDeniedUsers } = usePermissions();

  /*
   * Hooks
   */

  useEffect(() => {
    if (shouldFetchDeniedUsers) {
      refetchDeniedUsers?.();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper>
      <Main>
        <PermissionsForm />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 7rem;
  
  @media (min-width: 600px) {
    padding: 12px 8px;
    padding-bottom: 3rem;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
