export const PaymentPlatform = {
  VENMO: "venmo",
  HDFC: "hdfc"
} as const;

export type PaymentPlatformType = typeof PaymentPlatform[keyof typeof PaymentPlatform];
