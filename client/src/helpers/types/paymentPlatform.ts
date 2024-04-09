import americaFlagSvg from '../../assets/images/america-flag.svg';
import indiaFlagSvg from '../../assets/images/india-flag.svg';
import turkeyFlagSvg from '../../assets/images/turkey-flag.svg';
import europeFlagSvg from '../../assets/images/europe-flag.svg';

const USE_GARANTI = process.env.USE_GARANTI === 'true';
const USE_WISE = process.env.USE_WISE === 'true';
const USE_WISE_GBP_SGD = process.env.USE_WISE_GBP_SGD === 'true';

export const PaymentPlatform = {
  VENMO: "venmo",
  HDFC: "hdfc",
  GARANTI: "garanti",
  WISE: "wise",
  WISE_GBP: "wise_gbp",
  WISE_SGD: "wise_sgd",
};

function getPaymentPlatforms(USE_GARANTI: boolean, USE_WISE: boolean, USE_WISE_GBP_SGD: boolean): string[] {
  let platforms = [PaymentPlatform.VENMO, PaymentPlatform.HDFC];
  
  if (USE_GARANTI) {
    platforms.push(PaymentPlatform.GARANTI);
  };

  if (USE_WISE) {
    platforms.push(PaymentPlatform.WISE);
  };
  
  return platforms;
};

export const paymentPlatforms = getPaymentPlatforms(USE_GARANTI, USE_WISE, USE_WISE_GBP_SGD);

export type PaymentPlatformType = typeof PaymentPlatform[keyof typeof PaymentPlatform];

interface PaymentPlatformData {
  platformId: PaymentPlatformType;
  platformName: string;
  platformCurrency: string[];
  currencySymbols: string[];
  flagSvg: string;
}

export const paymentPlatformInfo: Record<PaymentPlatformType, PaymentPlatformData> = {
  [PaymentPlatform.VENMO]: {
    platformId: PaymentPlatform.VENMO,
    platformName: 'Venmo',
    platformCurrency: ['USD'],
    currencySymbols: ['$'],
    flagSvg: americaFlagSvg
  },
  [PaymentPlatform.HDFC]: {
    platformId: PaymentPlatform.HDFC,
    platformName: 'HDFC',
    platformCurrency: ['INR'],
    currencySymbols: ['₹'],
    flagSvg: indiaFlagSvg
  },
  [PaymentPlatform.GARANTI]: {
    platformId: PaymentPlatform.GARANTI,
    platformName: 'Garanti',
    platformCurrency: ['TRY'],
    currencySymbols: ['₺'],
    flagSvg: turkeyFlagSvg
  },
  [PaymentPlatform.WISE]: {
    platformId: PaymentPlatform.WISE,
    platformName: 'Wise',
    platformCurrency: ['EUR', 'GBP', 'SGD'],
    currencySymbols: ['€', '£', 'SGD$'],
    flagSvg: europeFlagSvg // TODO
  }
};
