import React, { useEffect } from 'react';
import styled from "styled-components";

import { RegistrationForm } from "@components/Registration"
import useRegistration from '@hooks/venmo/useRegistration';
import useHdfcRegistration from '@hooks/hdfc/useRegistration';
import useGarantiRegistration from '@hooks/garanti/useRegistration';
import useRevolutRegistration from '@hooks/revolut/useRegistration';
import usePlatformSettings from '@hooks/usePlatformSettings';
import useMediaQuery from '@hooks/useMediaQuery';


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
    refetchRampAccount: refetchGarantiAccount,
    shouldFetchRegistration: shouldFetchGarantiRegistration,
    refetchGarantiNftId,
    shouldFetchGarantiNftId
  } = useGarantiRegistration();

  const {
    refetchRampAccount: refetchRevolutAccount,
    shouldFetchRegistration: shouldFetchRevolutRegistration,
    // refetchVenmoNftId: refetchRevolutVenmoNftId,
    // shouldFetchVenmoNftId: shouldFetchRevolutVenmoNftId
  } = useRevolutRegistration();

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

        case PaymentPlatform.GARANTI:
          if (shouldFetchGarantiRegistration) {
            refetchGarantiAccount?.();
          }
  
          if (shouldFetchGarantiNftId) {
            refetchGarantiNftId?.();
          }
          break;

        case PaymentPlatform.REVOLUT:
          if (shouldFetchRevolutRegistration) {
            refetchRevolutAccount?.();
          }
  
          // if (shouldFetchRevolutVenmoNftId) {
          //   refetchRevolutVenmoNftId?.();
          // }
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

  @media (min-width: 425px) {
    padding: 12px 8px 0px;
  }
  padding-bottom: ${props => props.$isMobile ? '7rem' : '3rem'};
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
