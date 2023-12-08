import americaFlagSvg from '../../../assets/images/america-flag.svg';
import indiaFlagSvg from '../../../assets/images/india-flag.svg';


export const PaymentPlatform = {
  VENMO: "venmo",
  HDFC: "hdfc"
} as const;

export const paymentPlatforms = [PaymentPlatform.VENMO, PaymentPlatform.HDFC];

export type PaymentPlatformType = typeof PaymentPlatform[keyof typeof PaymentPlatform];

interface PaymentPlatformData {
  platformId: PaymentPlatformType;
  platformName: string;
  platformCurrency: string;
  flagSvg: string;
}

export const paymentPlatformInfo: Record<PaymentPlatformType, PaymentPlatformData> = {
  [PaymentPlatform.VENMO]: {
    platformId: PaymentPlatform.VENMO,
    platformName: 'Venmo',
    platformCurrency: 'USD',
    flagSvg: americaFlagSvg
  },
  [PaymentPlatform.HDFC]: {
    platformId: PaymentPlatform.HDFC,
    platformName: 'HDFC',
    platformCurrency: 'INR',
    flagSvg: indiaFlagSvg
  }
};
