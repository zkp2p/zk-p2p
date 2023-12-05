import { createContext } from 'react';

import { PaymentPlatformType } from './types';


interface PlatformSettingsValues {
  paymentPlatform?: PaymentPlatformType;
  setPaymentPlatform?: React.Dispatch<React.SetStateAction<PaymentPlatformType>>;
}

const PlatformSettingsContext = createContext<PlatformSettingsValues>({});

export default PlatformSettingsContext;
