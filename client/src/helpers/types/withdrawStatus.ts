export const WithdrawTransactionStatus = {
  DEFAULT: 'default',
  INVALID_RECIPIENT_ADDRESS: 'invalid_recipient_address',
  MISSING_AMOUNTS: 'missing_amounts',
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  TRANSACTION_SIGNING: 'transaction_signing',
  TRANSACTION_MINING: 'transaction_mining',
  VALID: 'valid',
  TRANSACTION_SUCCEEDED: 'transaction_succeeded'
};

export type WithdrawTransactionStatusType = typeof WithdrawTransactionStatus[keyof typeof WithdrawTransactionStatus];