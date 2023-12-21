import React, { useEffect } from 'react';
import styled from "styled-components";

import PermissionsForm from "@components/Permissions"
import usePermissions from "@hooks/usePermissions";
import useMediaQuery from '@hooks/useMediaQuery';


export const Permissions: React.FC = () => {
  /*
   * Contexts
   */

  const currentDeviceSize = useMediaQuery();

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
    <PageWrapper $isMobile={currentDeviceSize === 'tablet' || currentDeviceSize === 'mobile'}>
      <Main>
        <PermissionsForm />
      </Main>
    </PageWrapper>
  );
};

const PageWrapper = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;
  padding-bottom: ${props => props.$isMobile ? '7rem' : '4rem'};
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
