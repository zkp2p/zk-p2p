/*
 * Tooltips
 */

export const PROVING_TYPE_TOOLTIP = `
   Fast verification sends your email to our servers for processing (30 to 60 seconds).
  Private verification processes locally in your browser (8 minutes).
`;

export const UPLOAD_TYPE_TOOLTIP = `
  Login uses Google authentication to pull in your past HDFC transaction emails.
  Data is NEVER stored.
  Upload requires you to manually input the .eml file.
`;


export const EMAIL_TOOLTIP = `
  Open any HDFC transaction email and select 'Show original' to view the full contents.
`;


/*
 * Instruction Drawer
 */

export const INSTRUCTION_DRAWER_STEP_ONE = `
  Enter an amount to receive a quote. You are assigned the best available rate for the requested amount
`;

export const INSTRUCTION_DRAWER_STEP_TWO = `
  Optionally, provide a recipient address below to receive funds in another wallet. Submit transaction to start your order
`;

export const INSTRUCTION_DRAWER_STEP_THREE = `
  Click 'Send' and complete the payment on Venmo. Ensure you have email notifications from Venmo enabled
`;

export const INSTRUCTION_DRAWER_STEP_FOUR = `
  Continue through to validate email proof of transaction. Submit transaction containing proof to receive the requested USDC
`;

/*
 * Payment Requirements
 */

export const PAYMENT_REQUIREMENT_STEP_ONE = `
  Email notifications are enabled in your Venmo notifications settings
`;

export const PAYMENT_REQUIREMENT_STEP_TWO = `
  Amount USD to send, which may not match your requested USDC amount, is double checked
`;

export const PAYMENT_REQUIREMENT_STEP_THREE = `
  'Turn on for purchases' at the payment screen is toggled off
`;



/*
 * On Ramper Intent
 */

export const ON_RAMPER_INTENT_INSTRUCTIONS = `
  You have been matched with the depositor below. To complete, the flow,
  you must send a payment for the correct amount on Venmo, and then validate
  the payment by providing the transaction email. Click Send to begin.
`;

/*
 * Proof Form
 */

export const PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS = `
  Provide any historical transaction email sent from HDFC containing "❗ You have done a UPI txn. Check details!" in the
  subject to complete registration. Base ETH is required to submit a registration transaction.
`;

/*
 * Instructions
 */

export const REGISTRATION_INSTRUCTIONS = `
  You must register in order to use ZKP2P. Registration requires a confirmation email from HDFC
  with subject "❗ You have done a UPI txn. Check details!", which is used to prove you own a HDFC
   account. Your HDFC ID is hashed to conceal your identity.
`;

/*
 * New Deposit
 */

export const NEW_DEPOSIT_INSTRUCTIONS = `
  Creating a new deposit requires you to submit your UPI ID, the USDC liquidity to deposit and
  desired USD conversion rate. Your UPI ID must match the ID you registered with. Instructions
  on how to fetch your UPI ID can be found here.
`

export const NEW_DEPOSIT_UPI_ID_TOOLTIP = `
  This is a valid UPI ID where users will send payments.
  This connects your UPI account to your wallet address on chain.
  This must match the HDFC account you used to register.
`;

export const NEW_DEPOSIT_DEPOSIT_TOOLTIP = `
  This is the amount of USDC you will deposit for users to claim by sending you HDFC payments.
  You can withdraw unclaimed USDC or USDC not locked for orders at any time.
`;

export const NEW_DEPOSIT_RECEIVE_TOOLTIP = `
  This is the amount of USD you will receive if your entire deposit is claimed.
`;


/*
 * Proof Form
 */

export const PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS = `
  Provide any historical transaction email sent from Venmo containing "You paid" in the subject to
  complete registration. Base ETH is required to submit a registration transaction.
`;

export const PROOF_FORM_TITLE_SEND_INSTRUCTIONS = `
  Provide the transaction email containing "You paid" to complete the order. You can sign in with
  Google to pull the emails or paste the contents directly.
`;

export const PROOF_FORM_UPLOAD_EMAIL_INSTRUCTIONS = `
  Follow this guide to download and upload the email.
`;

export const PROOF_FORM_PASTE_EMAIL_INSTRUCTIONS = `
  Follow this guide to copy and paste the email.
`;


/*
 * Proving Modal Steps
 */


export const PROOF_MODAL_DOWNLOAD_SUBTITLE = `
  Keys download (1.7GB) will complete in 3 minutes
`;