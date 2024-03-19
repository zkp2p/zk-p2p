export const NewDepositTransactionStatus = {
  MISSING_REGISTRATION: 'missing_registration',
  DEFAULT: 'default',
  INVALID_DEPOSITOR_ID: 'invalid_depositor_id',
  MISSING_AMOUNTS: 'missing_amounts',
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  APPROVAL_REQUIRED: 'approval_required',
  TRANSACTION_SIGNING: 'transaction_signing',
  TRANSACTION_MINING: 'transaction_mining',
  CONVENIENCE_FEE_INVALID: 'convenience_fee_invalid',
  MAX_INTENTS_REACHED: 'max_intents_reached',
  MIN_DEPOSIT_THRESHOLD_NOT_MET: 'min_deposit_threshold_not_met',
  VALID: 'valid',
  TRANSACTION_SUCCEEDED: 'transaction_succeeded'
};

export type NewDepositTransactionStatusType = typeof NewDepositTransactionStatus[keyof typeof NewDepositTransactionStatus];

export const NewWiseDepositTransactionStatus = {
  ...NewDepositTransactionStatus,
  MISSING_MULTICURRENCY_REGISTRATION: 'transaction_failed'
};

export type NewWiseDepositTransactionStatusType = typeof NewWiseDepositTransactionStatus[keyof typeof NewWiseDepositTransactionStatus];