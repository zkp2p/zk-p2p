import { createContext } from 'react';

import {
  PaymentPlatformType,
  PaymentPlatform,
  paymentPlatforms,
} from './types';


interface PlatformSettingsValues {
  paymentPlatform?: PaymentPlatformType;
  setPaymentPlatform?: React.Dispatch<React.SetStateAction<PaymentPlatformType>>;
  PaymentPlatform: typeof PaymentPlatform;
  paymentPlatforms: PaymentPlatformType[];
};

const defaultValues: PlatformSettingsValues = {
  paymentPlatforms: paymentPlatforms,
  PaymentPlatform

};

const PlatformSettingsContext = createContext<PlatformSettingsValues>(defaultValues);

export default PlatformSettingsContext;
