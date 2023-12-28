import React, { useEffect } from 'react';
import styled from "styled-components";

import { RegistrationForm } from "@components/Registration"
import useRegistration from '@hooks/venmo/useRegistration';
import useHdfcRegistration from '@hooks/hdfc/useRegistration';
import usePlatformSettings from '@hooks/usePlatformSettings';


export const Registration: React.FC = () => {
  /*
   * Contexts
   */

  const {
    refetchRampAccount: refetchVenmoAccount,
    shouldFetchRegistration: shouldFetchVenmoRegistration,
    refetchVenmoNftId,
    shouldFetchVenmoNftId
  } = useRegistration();

  const {
    refetchRampAccount: refetchHdfcAccount,
    shouldFetchRegistration: shouldFetchHdfcRegistration,
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
        break;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  padding-bottom: 3rem;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
