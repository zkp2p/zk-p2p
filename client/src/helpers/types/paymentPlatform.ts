import americaFlagSvg from '../../assets/images/america-flag.svg';
import indiaFlagSvg from '../../assets/images/india-flag.svg';
import turkeyFlagSvg from '../../assets/images/turkey-flag.svg';
import europeFlagSvg from '../../assets/images/europe-flag.svg';

const USE_GARANTI = process.env.USE_GARANTI === 'true';
const USE_REVOLUT = process.env.USE_REVOLUT === 'true';

export const PaymentPlatform = {
  VENMO: "venmo",
  HDFC: "hdfc",
  GARANTI: "garanti",
  REVOLUT: "revolut"
};

function getPaymentPlatforms(USE_GARANTI: boolean, USE_REVOLUT: boolean): string[] {
  let platforms = [PaymentPlatform.VENMO, PaymentPlatform.HDFC];
  
  if (USE_GARANTI) {
    platforms.push(PaymentPlatform.GARANTI);
  };

  if (USE_REVOLUT) {
    platforms.push(PaymentPlatform.REVOLUT);
  };

  return platforms;
};

export const paymentPlatforms = getPaymentPlatforms(USE_GARANTI, USE_REVOLUT);

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
  [PaymentPlatform.REVOLUT]: {
    platformId: PaymentPlatform.REVOLUT,
    platformName: 'Revolut',
    platformCurrency: 'EUR',
    flagSvg: europeFlagSvg
  }
};
