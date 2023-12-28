import { createContext } from 'react';

import {
  PaymentPlatformType,
  PaymentPlatform,
  paymentPlatforms,
} from '@helpers/types';


interface PlatformSettingsValues {
  paymentPlatform?: PaymentPlatformType;
  setPaymentPlatform?: React.Dispatch<React.SetStateAction<PaymentPlatformType>>;
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
};

const PlatformSettingsContext = createContext<PlatformSettingsValues>(defaultValues);

export default PlatformSettingsContext;
