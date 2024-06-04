import americaFlagSvg from '../../assets/images/america-flag.svg';
import indiaFlagSvg from '../../assets/images/india-flag.svg';
import turkeyFlagSvg from '../../assets/images/turkey-flag.svg';
import europeFlagSvg from '../../assets/images/europe-flag.svg';
import ukFlagSvg from '../../assets/images/uk-flag.svg';
import singaporeFlagSvg from '../../assets/images/singapore-flag.svg';

const USE_GARANTI = process.env.USE_GARANTI === 'true';
const USE_REVOLUT = process.env.USE_REVOLUT === 'true';
const USE_REVOLUT_MULTICURRENCY = process.env.USE_REVOLUT_MULTICURRENCY === 'true'; 

export const PaymentPlatform = {
  VENMO: "venmo",
  HDFC: "hdfc",
  GARANTI: "garanti",
  REVOLUT: "revolut"
};

export const CurrencyCode = {
  USD: "USD",
  INR: "INR",
  TRY: "TRY",
  EUR: "EUR",
  GBP: "GBP",
  SGD: "SGD",
};

export const CurrencyIndex = {
  DEFAULT: 0,
  USD: 0,
  INR: 0,
  TRY: 0,
  EUR: 0,
  GBP: 1,
  SGD: 2,
  USD_REVOLUT: 3
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

function getRevolutPlatformCurrencies(USE_WISE_MULTICURRENCY: boolean): CurrencyCodeType[] {
  let currencies = [CurrencyCode.EUR];

  if (USE_REVOLUT_MULTICURRENCY) {
    currencies.push(CurrencyCode.GBP);
    currencies.push(CurrencyCode.SGD);
    currencies.push(CurrencyCode.USD);
  };

  return currencies;
};

export const paymentPlatforms = getPaymentPlatforms(USE_GARANTI, USE_REVOLUT);
export type PaymentPlatformType = typeof PaymentPlatform[keyof typeof PaymentPlatform];
export type CurrencyCodeType = typeof CurrencyCode[keyof typeof CurrencyCode];
export type CurrencyIndexType = typeof CurrencyIndex[keyof typeof CurrencyIndex];

interface PaymentPlatformData {
  platformId: PaymentPlatformType;
  platformName: string;
  platformCurrencies: CurrencyCodeType[];
  flagSvgs: string[];
}

export const paymentPlatformInfo: Record<PaymentPlatformType, PaymentPlatformData> = {
  [PaymentPlatform.VENMO]: {
    platformId: PaymentPlatform.VENMO,
    platformName: 'Venmo',
    platformCurrencies: [CurrencyCode.USD],
    flagSvgs: [americaFlagSvg],
  },
  [PaymentPlatform.HDFC]: {
    platformId: PaymentPlatform.HDFC,
    platformName: 'HDFC',
    platformCurrencies: [CurrencyCode.INR],
    flagSvgs: [indiaFlagSvg],
  },
  [PaymentPlatform.GARANTI]: {
    platformId: PaymentPlatform.GARANTI,
    platformName: 'Garanti',
    platformCurrencies: [CurrencyCode.TRY],
    flagSvgs: [turkeyFlagSvg]
  },
  [PaymentPlatform.REVOLUT]: {
    platformId: PaymentPlatform.REVOLUT,
    platformName: 'Revolut',
    platformCurrencies: getRevolutPlatformCurrencies(USE_REVOLUT_MULTICURRENCY),
    flagSvgs: [europeFlagSvg, ukFlagSvg, singaporeFlagSvg, americaFlagSvg]
  }
};
