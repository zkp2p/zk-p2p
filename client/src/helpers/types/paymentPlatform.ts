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
  platformCurrencies: string[];
  currencySymbols: string[];
  flagSvgs: string[];
  platformCurrencyIcons: string[];
}

export const paymentPlatformInfo: Record<PaymentPlatformType, PaymentPlatformData> = {
  [PaymentPlatform.VENMO]: {
    platformId: PaymentPlatform.VENMO,
    platformName: 'Venmo',
    platformCurrencies: ['USD'],
    currencySymbols: ['$'],
    flagSvgs: [americaFlagSvg],
    platformCurrencyIcons: ['usdc'] // TODO: need USD icon
  },
  [PaymentPlatform.HDFC]: {
    platformId: PaymentPlatform.HDFC,
    platformName: 'HDFC',
    platformCurrencies: ['INR'],
    currencySymbols: ['₹'],
    flagSvgs: [indiaFlagSvg],
    platformCurrencyIcons: ['usdc'] // TODO: need INR icon
  },
  [PaymentPlatform.GARANTI]: {
    platformId: PaymentPlatform.GARANTI,
    platformName: 'Garanti',
    platformCurrencies: ['TRY'],
    currencySymbols: ['₺'],
    flagSvgs: [turkeyFlagSvg],
    platformCurrencyIcons: ['usdc'] // TODO: need TRY icon
  },
  [PaymentPlatform.WISE]: {
    platformId: PaymentPlatform.WISE,
    platformName: 'Wise',
    platformCurrencies: ['EUR', 'GBP', 'SGD'],
    currencySymbols: ['€', '£', 'SGD$'],
    flagSvgs: [europeFlagSvg, americaFlagSvg, turkeyFlagSvg],
    platformCurrencyIcons: ['usdc', 'usdc', 'usdc'] // TODO: need EUR, GBP, SGD icons
  }
};
