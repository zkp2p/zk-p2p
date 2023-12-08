import React, { useEffect, useState, ReactNode } from 'react';

import { PaymentPlatform, PaymentPlatformType, paymentPlatforms } from './types';

import PlatformSettingsContext from './PlatformSettingsContext'


interface ProvidersProps {
  children: ReactNode;
};

const PlatformSettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * State
   */

  const [paymentPlatform, setPaymentPlatform] = useState<PaymentPlatformType>(PaymentPlatform.VENMO);

  /*
   * Hooks
   */

  useEffect(() => {
    const storedSelectedPaymentPlatform = localStorage.getItem('storedSelectedPaymentPlatform');
    
    if (storedSelectedPaymentPlatform) {
      setPaymentPlatform(JSON.parse(storedSelectedPaymentPlatform));
    }
  }, []);

  useEffect(() => {
    if (paymentPlatform) {
      localStorage.setItem('storedSelectedPaymentPlatform', JSON.stringify(paymentPlatform));
    }
  }, [paymentPlatform]);

  return (
    <PlatformSettingsContext.Provider
      value={{
        paymentPlatform,
        setPaymentPlatform,
        PaymentPlatform,
        paymentPlatforms
      }}
    >
      {children}
    </PlatformSettingsContext.Provider>
  );
};

export default PlatformSettingsProvider;
