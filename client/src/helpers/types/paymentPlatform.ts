import americaFlagSvg from '../../assets/images/america-flag.svg';
import indiaFlagSvg from '../../assets/images/india-flag.svg';
import turkeyFlagSvg from '../../assets/images/turkey-flag.svg';

const USE_GARANTI = process.env.USE_GARANTI === 'true';

export const PaymentPlatform = {
  VENMO: "venmo",
  HDFC: "hdfc",
  GARANTI: "garanti"
} as const;

export const paymentPlatforms = USE_GARANTI ? 
  [PaymentPlatform.VENMO, PaymentPlatform.HDFC, PaymentPlatform.GARANTI] :
  [PaymentPlatform.VENMO, PaymentPlatform.HDFC];

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
  },
  [PaymentPlatform.GARANTI]: {
    platformId: PaymentPlatform.GARANTI,
    platformName: 'Garanti',
    platformCurrency: 'TRY',
    flagSvg: turkeyFlagSvg
  }
};
