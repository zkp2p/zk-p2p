import React, { useEffect, useState, ReactNode } from 'react';

import { PaymentPlatform, PaymentPlatformType, paymentPlatforms } from '@helpers/types';

import PlatformSettingsContext from './PlatformSettingsContext'


interface ProvidersProps {
  children: ReactNode;
};

const PlatformSettingsProvider = ({ children }: ProvidersProps) => {
  /*
   * State
   */

  const [paymentPlatform, setPaymentPlatform] = useState<PaymentPlatformType>(PaymentPlatform.VENMO);

  const [didUserReviewRequirementsForPlatform, setDidUserReviewRequirementsForPlatform] = useState<boolean>(false);

  /*
   * Hooks
   */

  useEffect(() => {
    const storedSelectedPaymentPlatform = localStorage.getItem('storedSelectedPaymentPlatform');
    
    if (storedSelectedPaymentPlatform) {
      setPaymentPlatform(storedSelectedPaymentPlatform);
    }
  }, []);

  useEffect(() => {
    if (paymentPlatform) {
      localStorage.setItem('storedSelectedPaymentPlatform', JSON.stringify(paymentPlatform));
    }
  }, [paymentPlatform]);

  useEffect(() => {
    const reviewStatusKey = getReviewStatusKey(paymentPlatform);

    const storedReviewStatus = localStorage.getItem(reviewStatusKey);
    
    if (storedReviewStatus) {
      setDidUserReviewRequirementsForPlatform(JSON.parse(storedReviewStatus));
    }
  }, [paymentPlatform]);

  useEffect(() => {
    const reviewStatusKey = getReviewStatusKey(paymentPlatform);

    localStorage.setItem(reviewStatusKey, JSON.stringify(didUserReviewRequirementsForPlatform));
  }, [didUserReviewRequirementsForPlatform, paymentPlatform]);

  /*
   * Public
   */

  const reviewedRequirementsForPlatform = () => {
    const reviewStatusKey = getReviewStatusKey(paymentPlatform);
    const storedReviewStatus = localStorage.getItem(reviewStatusKey);
    
    return storedReviewStatus ? JSON.parse(storedReviewStatus) : false;
  };

  const markPlatformRequirementsAsReviewed = () => {
    setDidUserReviewRequirementsForPlatform(true);
  };

  /*
   * Helpers
   */

  const getReviewStatusKey = (platform: PaymentPlatformType) => `storedReviewStatus_${platform}`;

  return (
    <PlatformSettingsContext.Provider
      value={{
        paymentPlatform,
        setPaymentPlatform,
        PaymentPlatform,
        paymentPlatforms,
        reviewedRequirementsForPlatform,
        markPlatformRequirementsAsReviewed
      }}
    >
      {children}
    </PlatformSettingsContext.Provider>
  );
};

export default PlatformSettingsProvider;
