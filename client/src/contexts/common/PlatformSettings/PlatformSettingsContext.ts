import { createContext } from 'react';

import { CurrencyIndexType, PaymentPlatformType, PaymentPlatform, paymentPlatforms } from '@helpers/types';


interface PlatformSettingsValues {
  paymentPlatform?: PaymentPlatformType;
  setPaymentPlatform?: React.Dispatch<React.SetStateAction<PaymentPlatformType>>;
  currencyIndex: CurrencyIndexType;
  setCurrencyIndex: React.Dispatch<React.SetStateAction<CurrencyIndexType>>;
  PaymentPlatform: typeof PaymentPlatform;
  paymentPlatforms: PaymentPlatformType[];
  reviewedRequirementsForPlatform: () => boolean;
  markPlatformRequirementsAsReviewed: () => void;
};

const defaultValues: PlatformSettingsValues = {
  paymentPlatforms: paymentPlatforms,
  PaymentPlatform,
  reviewedRequirementsForPlatform: () => false,
  markPlatformRequirementsAsReviewed: () => {},
  currencyIndex: 0,
  setCurrencyIndex: () => {},
};

const PlatformSettingsContext = createContext<PlatformSettingsValues>(defaultValues);

export default PlatformSettingsContext;
