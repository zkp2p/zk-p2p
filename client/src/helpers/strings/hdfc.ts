import { PlatformStrings } from './platform';

const strings: PlatformStrings = {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: `
    Provide any historical transaction email sent from HDFC InstaAlerts containing "You have done a UPI" in the subject to
    complete registration. Base ETH is required to submit a registration transaction.
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
  PROOF_FORM_TITLE_SEND_INSTRUCTIONS: ``,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: `
    Creating a new deposit requires you to submit your UPI ID, the USDC liquidity to deposit and
    desired USD conversion rate. Your UPI ID must match the ID you registered with. Instructions
    on how to fetch your UPI ID can be found here.
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
    Please send the payment only from the UPI ID linked to your HDFC bank account. Please don't send payment from UPI Lite or any other UPI ID  
  `,
  PAYMENT_REQUIREMENT_STEP_TWO: `
    HDFC InstaAlert email notifications are enabled in your bank account notification settings  
  `,
  PAYMENT_REQUIREMENT_STEP_THREE: `
    Amount INR to send, which may not match your requested USDC amount, is double checked
  `,

};

export default strings;