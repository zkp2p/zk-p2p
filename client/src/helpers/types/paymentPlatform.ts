import americaFlagSvg from '../../assets/images/america-flag.svg';
import indiaFlagSvg from '../../assets/images/india-flag.svg';
import turkeyFlagSvg from '../../assets/images/turkey-flag.svg';
import europeFlagSvg from '../../assets/images/europe-flag.svg';
import ukFlagSvg from '../../assets/images/uk-flag.svg';
import singaporeFlagSvg from '../../assets/images/singapore-flag.svg';


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

function getPaymentPlatforms(): string[] {
  let platforms = [
    PaymentPlatform.VENMO,
    PaymentPlatform.HDFC,
    PaymentPlatform.GARANTI,
    PaymentPlatform.REVOLUT
  ];

  return platforms;
};

function getRevolutPlatformCurrencies(): CurrencyCodeType[] {
  let currencies = [
    CurrencyCode.EUR,
    CurrencyCode.GBP,
    CurrencyCode.SGD,
    CurrencyCode.USD
  ];

  return currencies;
};

export const paymentPlatforms = getPaymentPlatforms();
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
    platformCurrencies: getRevolutPlatformCurrencies(),
    flagSvgs: [europeFlagSvg, ukFlagSvg, singaporeFlagSvg, americaFlagSvg]
  }
};
