export const TransactionStatus = {
  TRANSACTION_CONFIGURED: "transaction-configured",
  TRANSACTION_LOADING: "transaction-loading",
  TRANSACTION_MINING: "transaction-mining",
  TRANSACTION_MINED: "transaction-mined",
};

export type TransactionStatusType = typeof TransactionStatus[keyof typeof TransactionStatus];