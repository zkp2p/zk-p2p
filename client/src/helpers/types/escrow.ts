import { PaymentPlatformType } from '@helpers/types';

export interface PaymentVerificationData {
  intentGatingService: string;
  conversionRate: bigint;
  payeeDetailsHash: string;
  data: string;
}

export interface Range {
  min: bigint;
  max: bigint;
}

export interface Deposit {
  depositor: string;
  token: string;
  depositAmount: bigint;
  minIntentAmount: bigint;
  maxIntentAmount: bigint;
  verifiers: string[];
  acceptingIntents: boolean;
  remainingDepositAmount: bigint;
  outstandingIntentAmount: bigint;
  intentHashes: string[];
}

export interface Intent {
  owner: string;
  to: string;
  depositId: bigint;
  amount: bigint;
  timestamp: bigint;
  paymentVerifier: string;
}

export interface VerifierDataView {
  verifier: string;
  verificationData: PaymentVerificationData;
}

export interface DepositView {
  depositId: bigint;
  deposit: Deposit;
  availableLiquidity: bigint;
  verifiers: VerifierDataView[];
}

export interface StoredDeposit extends DepositView {
  depositId: bigint;
}

export interface IntentView {
  intentHash: string;
  intent: Intent;
}

export interface IndicativeQuote {
  depositId?: bigint;
  error?: string;
  maxTokenAmount?: bigint;
  minFiatAmount?: bigint;
}

export interface DepositIntent {
  deposit: Deposit;
  intent: Intent;
  intentHash: string;
}

export interface OnRamperIntent {
  depositor: string;
  intent: Intent;
}
