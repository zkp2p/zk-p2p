export const ProofGenerationStatus = {
  NOT_STARTED: "not-started",
  GENERATING_INPUT: "generating-input",
  UPLOADING_PROOF_FILES: "uploading-proof-files",
  DOWNLOADING_PROOF_FILES: "downloading-proof-files",
  GENERATING_PROOF: "generating-proof",
  TRANSACTION_CONFIGURED: "transaction-configured",
  TRANSACTION_LOADING: "transaction-loading",
  TRANSACTION_MINING: "transaction-mining",
  ERROR_BAD_INPUT: "error-bad-input",
  ERROR_DOWNLOAD_FAILED: "error-failed-to-download",
  ERROR_FAILED_TO_PROVE: "error-failed-to-prove",
  DONE: "done"
};

export const EmailInputStatus = {
  DEFAULT: "default",
  INVALID_SIGNATURE: "invalid-signature",
  INVALID_SUBJECT: "invalid-subject",
  VALID: "valid"
};