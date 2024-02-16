import React, { useState } from 'react';
import styled from 'styled-components/macro'

import { ExistingRegistration as VenmoExistingRegistration } from "@components/Registration/venmo/ExistingRegistration";
import { ExistingRegistration as HdfcExistingRegistration } from '@components/Registration/hdfc/ExistingRegistration';
import { ExistingRegistration as GarantiExistingRegistration } from '@components/Registration/garanti/ExistingRegistration';
import { NewRegistration as VenmoNewRegistration } from "@components/Registration/venmo/NewRegistration";
import { NewRegistration as HdfcNewRegistration } from '@components/Registration/hdfc/NewRegistration';
import { NewRegistration as GarantiNewRegistration } from '@components/Registration/garanti/NewRegistration';
import usePlatformSettings from '@hooks/usePlatformSettings';

 
export const RegistrationForm: React.FC = () => {
  /*
   * Context
   */

  const { PaymentPlatform, paymentPlatform } = usePlatformSettings();

  /*
   * State
   */

  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(false);

  /*
   * Handlers
   */

  const handleUpdateClick = () => {
    setIsNewRegistration(true);
  }

  const handleBackClick = () => {
    setIsNewRegistration(false);
  }

  /*
   * Component
   */

  const existingRegistrationComponent = () => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        return <VenmoExistingRegistration handleNewRegistrationClick={handleUpdateClick} />;

      case PaymentPlatform.HDFC:
        return <HdfcExistingRegistration handleNewRegistrationClick={handleUpdateClick} />;
      
      case PaymentPlatform.GARANTI:
        return <GarantiExistingRegistration handleNewRegistrationClick={handleUpdateClick} />;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
  };

  const newRegistrationComponent = () => {
    switch (paymentPlatform) {
      case PaymentPlatform.VENMO:
        return <VenmoNewRegistration handleBackClick={handleBackClick} />;

      case PaymentPlatform.HDFC:
        return <HdfcNewRegistration handleBackClick={handleBackClick} />;

      case PaymentPlatform.GARANTI:
        return <GarantiNewRegistration handleBackClick={handleBackClick} />;

      default:
        throw new Error(`Unknown payment platform: ${paymentPlatform}`);
    }
  };

  return (
    <Wrapper>
      {!isNewRegistration ? (
        existingRegistrationComponent()
      ) : (
        newRegistrationComponent()
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 660px;
  width: 100%;
`;
