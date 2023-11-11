/*
 * Tooltips
 */

export const PROVING_TYPE_TOOLTIP = `
  Fast verification sends your email to our servers for processing (30 to 60 seconds).
  Private verification processes locally in your browser (10 minutes).
`;

export const UPLOAD_TYPE_TOOLTIP = `
  Login uses Google authentication to pull in your past Venmo transaction emails. Data is NEVER stored.
  Upload requires you to manually input the .eml file.
`;

export const INPUT_MODE_TOOLTIP = `
  Drag the .eml file into the box to automatically load the contents.
  You can also Paste the contents directly.
`;

export const EMAIL_TOOLTIP = `
  Open any Venmo transaction email and select 'Show original' to view the full contents.
`;

export const PROOF_TOOLTIP = `
  The proof is a cryptographic signature that shows you sent the email using contents
  and signatures that exist in the email.
`;

/*
 * Instructions
 */

export const REGISTRATION_INSTRUCTIONS = `
  Registration requires a previously send payment confirmation email from Venmo, which proves you own a Venmo account.
  Your ID is hashed to conceal your identity.
`;

export const SIGN_IN_WITH_GOOGLE_INSTRUCTIONS = `
Sign in with Google to pull in your past Venmo transaction emails. The emails never leave your browser. Read more.
`;

/*
* New Deposit
*/

export const NEW_DEPOSIT_INSTRUCTIONS = `
  Creating a new deposit requires you to submit your Venmo ID, the USDC liquidity to deposit and desired USD conversion rate.
  Your Venmo ID must match the ID you registered with. Instructions on how to fetch you Venmo ID can be found here.
`

export const NEW_DEPOSIT_VENMO_ID_TOOLTIP = `
  This is a valid 18-19 digit Venmo ID where users will send payments.
  This connects your Venmo account to your wallet address on chain.
  This must match the Venmo account you used to register.
`;

export const NEW_DEPOSIT_DEPOSIT_TOOLTIP = `
  This is the amount of USDC you will deposit for users to claim by sending you Venmo payments.
  You can withdraw unclaimed USDC or USDC not locked for orders at any time.
`;

export const NEW_DEPOSIT_RECEIVE_TOOLTIP = `
  This is the amount of USD you will receive if your entire deposit is claimed.
`;

/*
 * Proof Form
 */

export const PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS = `
  Supply a previous transaction email from Venmo containing "You paid". Choose your input method and verification type below. Emails are never stored.
`;

export const PROOF_FORM_TITLE_SEND_INSTRUCTIONS = `
  Supply the transaction email containing "You paid". Choose your verification type below. Emails are never stored.
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
