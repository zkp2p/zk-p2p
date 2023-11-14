export type ProofGenerationStatus =
  | "not-started"
  | "generating-input"
  | "uploading-proof-files"
  | "downloading-proof-files"
  | "generating-proof"
  | "transaction-configured"
  | "transaction-mining"
  | "error-bad-input"
  | "error-failed-to-download"
  | "error-failed-to-prove"
  | "done";
