import React, { useEffect, useState, ReactNode } from 'react';

import { CurrencyIndex, PaymentPlatform, PaymentPlatformType, paymentPlatforms } from '@helpers/types';
import useQuery from '@hooks/useQuery';

import PlatformSettingsContext from './PlatformSettingsContext'


interface ProvidersProps {
  children: ReactNode;
};

const PlatformSettingsProvider = ({ children }: ProvidersProps) => {
  const { queryParams } = useQuery();
  const platformFromQuery = queryParams.PLATFORM;
  const currencyIndexFromQuery = queryParams.CURRENCY_INDEX;

  /*
   * State
   */

  const [paymentPlatform, setPaymentPlatform] = useState<PaymentPlatformType>(PaymentPlatform.VENMO);
  const [currencyIndex, setCurrencyIndex] = useState<number>(CurrencyIndex.USD);

  const [didUserReviewRequirementsForPlatform, setDidUserReviewRequirementsForPlatform] = useState<boolean>(false);

  /*
   * Hooks
   */

  useEffect(() => {
    const storedSelectedPaymentPlatform = localStorage.getItem('storedSelectedPaymentPlatform');
    
    if (storedSelectedPaymentPlatform) {
      setPaymentPlatform(JSON.parse(storedSelectedPaymentPlatform));
      setCurrencyIndex(Number(0));
    }

    if (platformFromQuery && currencyIndexFromQuery) {
      const isValidPlatformFromQuery = Object.values(PaymentPlatform).includes(platformFromQuery);
      const isValidCurrencyIndexFromQuery = Object.values(CurrencyIndex).includes(parseInt(currencyIndexFromQuery));

      if (isValidPlatformFromQuery && isValidCurrencyIndexFromQuery) {
        setPaymentPlatform(platformFromQuery as PaymentPlatformType);
        setCurrencyIndex(parseInt(currencyIndexFromQuery));
      }
    }
  }, [platformFromQuery, currencyIndexFromQuery]);

  useEffect(() => {
    if (paymentPlatform) {
      localStorage.setItem('storedSelectedPaymentPlatform', JSON.stringify(paymentPlatform));
      localStorage.setItem('storedSelectedCurrencyIndex', JSON.stringify(currencyIndex));
    }
  }, [paymentPlatform, currencyIndex]);

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
        currencyIndex,
        setCurrencyIndex,
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
