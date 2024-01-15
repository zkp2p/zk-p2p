import { PlatformStrings } from './platform';

const strings: PlatformStrings = {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: `
    Provide a historical transaction email sent from HDFC InstaAlerts containing "You have done a UPI txn" in
    the subject received after November 4th, 2023 to complete registration. Base ETH is required to submit a
    registration transaction.
  `,

  // Mail Instructions
  SIGN_IN_WITH_GOOGLE_INSTRUCTIONS: `
    Sign in with Google to pull in your HDFC transaction emails. The emails are not stored and never
    leave your browser. Read more:
  `,
  NO_EMAILS_ERROR: `
    No HDFC emails found.
    Please ensure you are using an email attached to a valid HDFC account.
  `,

  // New Registration
  REGISTRATION_INSTRUCTIONS: `
    You must register in order to use ZKP2P. Registration requires a confirmation email from HDFC
    with subject "You have done a UPI txn", which is used to prove you own a HDFC account. Your HDFC ID is
    hashed to conceal your identity.
  `,

  // On Ramp Instructions
  PROOF_FORM_TITLE_SEND_INSTRUCTIONS: `
    Provide the transaction alert email you received from HDFC containing "You have done a UPI txn"
    to complete the order. You can sign in with Google to pull the email or manually upload/paste
    the email.
  `,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: `
    Creating a new deposit requires you to submit your UPI ID, the USDC liquidity to deposit and
    desired USDC/INR conversion rate. You will receive INR payments from users who claim your deposit.
    Your UPI ID is made public on-chain hence do not use your phone number UPI ID.
  `,
  NEW_DEPOSIT_ID_TOOLTIP: `
    This is a valid UPI ID where users will send payments.
    This connects your UPI account to your wallet address on chain.
    This must match the HDFC account you used to register.
  `,
  NEW_DEPOSIT_AMOUNT_TOOLTIP: `
    This is the amount of USDC you will deposit for users to claim by sending you HDFC payments.
    You can withdraw unclaimed USDC or USDC not locked for orders at any time.
  `,
  NEW_DEPOSIT_RECEIVE_TOOLTIP: `
    This is the amount of INR you will receive if your entire deposit is claimed.
  `,

  // Instruction Drawer
  INSTRUCTION_DRAWER_STEP_ONE: `
    Enter an amount to receive a quote. You are assigned the best available rate for the requested amount
  `,
  INSTRUCTION_DRAWER_STEP_TWO: `
    Optionally, provide a recipient address below to receive funds in another wallet. Submit transaction to start your order
  `,
  INSTRUCTION_DRAWER_STEP_THREE: `
    Click 'Send' and complete the payment on any UPI ID linked to your HDFC bank account. Ensure you have email notifications from HDFC InstaAlerts enabled
  `,
  INSTRUCTION_DRAWER_STEP_FOUR: `
    Continue through to validate email proof of transaction. Submit transaction containing proof to receive the requested USDC
  `,

  // Payment Requirements
  PAYMENT_REQUIREMENT_STEP_ONE: `
    Send payment from your UPI ID linked to your HDFC bank account. Do not send payment from UPI Lite or other bank accounts
  `,
  PAYMENT_REQUIREMENT_STEP_TWO: `
    HDFC InstaAlert email notifications are enabled for your account
  `,
  PAYMENT_REQUIREMENT_STEP_THREE: `
    Send the exact INR amount including decimals as displayed on the payment screen
  `,

};

export default strings;