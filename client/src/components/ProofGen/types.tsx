export type ProofGenerationStatus = 
  | "not-started"
  | "generating-input"
  | "downloading-proof-files"
  | "generating-proof"
  | "error-bad-input"
  | "error-failed-to-download"
  | "error-failed-to-prove"
  | "done"
  | "sending-on-chain"
  | "sent";