import React, { useEffect } from 'react';
import styled from "styled-components";
import useMediaQuery from '@hooks/useMediaQuery';

import { RegistrationForm } from "@components/Registration"
import useRegistration from '@hooks/venmo/useRegistration';
import useHdfcRegistration from '@hooks/hdfc/useRegistration';
import usePlatformSettings from '@hooks/usePlatformSettings';


export const Registration: React.FC = () => {
  /*
   * Contexts
   */

  const currentDeviceSize = useMediaQuery();

  const {
    refetchRampAccount: refetchVenmoAccount,
    shouldFetchRegistration: shouldFetchVenmoRegistration,
    refetchVenmoNftId,
    shouldFetchVenmoNftId
  } = useRegistration();

  const {
    refetchRampAccount: refetchHdfcAccount,
    shouldFetchRegistration: shouldFetchHdfcRegistration,
    refetchHdfcNftId,
    shouldFetchHdfcNftId
  } = useHdfcRegistration();

  const {
    PaymentPlatform,
    paymentPlatform
  } = usePlatformSettings();

  /*
   * Hooks
   */

  useEffect(() => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        if (shouldFetchVenmoRegistration) {
          refetchVenmoAccount?.();
        }
    
        if (shouldFetchVenmoNftId) {
          refetchVenmoNftId?.();
        }
        break;

      case PaymentPlatform.HDFC:
        if (shouldFetchHdfcRegistration) {
          refetchHdfcAccount?.();
        }

        if (shouldFetchHdfcNftId) {
          refetchHdfcNftId?.();
        }
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWrapper $isMobile={currentDeviceSize === 'tablet' || currentDeviceSize === 'mobile'}>
      <Main>
        <RegistrationForm />
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
