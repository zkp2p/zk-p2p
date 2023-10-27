/*
 * Tooltips
 */

export const PROVING_TYPE_TOOLTIP = `
  Fast verification sends your email to our servers for processing (30 seconds).
  Private verification processes in your browser (10 minutes).
`;

export const INPUT_MODE_TOOLTIP = `
  Drag the .eml file into the box to automatically load the contents.
  You can also Paste the contents directly.
`;

export const EMAIL_TOOLTIP = `
  Open any Venmo transaction email and select 'Show original' to view the full contents.
`;

export const PROOF_TOOLTIP = `
  The proof is a cryptographic signature that shows you sent or received the email using contents
  and signatures that exist in the email.
`;

/*
 * Instructions
 */

export const REGISTRATION_INSTRUCTIONS = `
  Registration requires a payment transaction email from Venmo. Your ID is hashed to conceal your identity.
`;

/*
 * Proof Form
 */

export const PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS = `
  Supply any previous transaction email from Venmo to register. Choose your input method and verification type below. Emails are never stored.
`;

export const PROOF_FORM_TITLE_SEND_INSTRUCTIONS = `
  Supply the transaction email containing "You paid". Choose your input method and verification type below. Emails are never stored.
`;

export const PROOF_FORM_TITLE_RECEIVE_INSTRUCTIONS = `
  Supply the transaction email containing "paid you". Choose your input method and verification type below. Emails are never stored.
`;

export const PROOF_FORM_UPLOAD_EMAIL_INSTRUCTIONS = `
  Select "Download message" and drag the .eml file here or "Show original" and paste the contents directly.
`;

/*
 * Proving Modal Steps
 */

export const PROOF_MODAL_DOWNLOAD_TITLE = `
  Downloading Verification Keys
`;

export const PROOF_MODAL_DOWNLOAD_SUBTITLE = `
  Keys download (1.7GB) will complete in 3 minutes
`;

export const PROOF_MODAL_PROVE_TITLE = `
  Validating Payment
`;

export const PROOF_MODAL_PROVE_SUBTITLE_PRIVATE = `
  Private validation will take approximately 9 minutes
`;

export const PROOF_MODAL_PROVE_SUBTITLE_FAST = `
  Fast validation will take approximately 30 seconds
`;

export const PROOF_MODAL_VERIFY_TITLE = `
  Local Proof Verification
`;

export const PROOF_MODAL_VERIFY_SUBTITLE = `
  Constructing and verifying transaction
`;

export const PROOF_MODAL_SUBMIT_TITLE = `
  Complete Order
`;

export const PROOF_MODAL_REGISTRATION_SUBMIT_TITLE = `
  Complete Registration
`;

export const PROOF_MODAL_SUBMIT_SUBTITLE = `
  Submit transaction to complete the on ramp
`;

export const PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE = `
  Submit transaction to complete registration
`;
