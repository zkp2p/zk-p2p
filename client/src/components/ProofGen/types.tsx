export type ProofGenerationStatus = 
  | "not-started"
  | "generating-input"
  | "downloading-proof-files"
  | "generating-proof"
  | "verifying-proof"
  | "error-bad-input"
  | "error-failed-to-download"
  | "error-failed-to-prove"
  | "done";
