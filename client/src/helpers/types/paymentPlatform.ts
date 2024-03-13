import americaFlagSvg from '../../assets/images/america-flag.svg';
import indiaFlagSvg from '../../assets/images/india-flag.svg';
import turkeyFlagSvg from '../../assets/images/turkey-flag.svg';
import europeFlagSvg from '../../assets/images/europe-flag.svg';

const USE_GARANTI = process.env.USE_GARANTI === 'true';
const USE_WISE = process.env.USE_WISE === 'true';

export const PaymentPlatform = {
  VENMO: "venmo",
  HDFC: "hdfc",
  GARANTI: "garanti",
  WISE: "wise"
};

function getPaymentPlatforms(USE_GARANTI: boolean, USE_WISE: boolean): string[] {
  let platforms = [PaymentPlatform.VENMO, PaymentPlatform.HDFC];
  
  if (USE_GARANTI) {
    platforms.push(PaymentPlatform.GARANTI);
  };

  if (USE_WISE) {
    platforms.push(PaymentPlatform.WISE);
  };

  return platforms;
};

export const paymentPlatforms = getPaymentPlatforms(USE_GARANTI, USE_WISE);

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
  },
  [PaymentPlatform.WISE]: {
    platformId: PaymentPlatform.WISE,
    platformName: 'Wise',
    platformCurrency: 'EUR',
    flagSvg: europeFlagSvg
  }
};
