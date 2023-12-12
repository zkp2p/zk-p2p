import { PlatformStrings } from './platform';

const strings: PlatformStrings = {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: `
    Provide any historical transaction email sent from HDFC containing "You_have_done_a_UPI" in the subject to
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
    with subject "You_have_done_a_UPI", which is used to prove you own a HDFC account. Your HDFC ID is
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
  INSTRUCTION_DRAWER_STEP_ONE: ``,
  INSTRUCTION_DRAWER_STEP_TWO: ``,
  INSTRUCTION_DRAWER_STEP_THREE: ``,
  INSTRUCTION_DRAWER_STEP_FOUR: ``,

  // Payment Requirements
  PAYMENT_REQUIREMENT_STEP_ONE: ``,
  PAYMENT_REQUIREMENT_STEP_TWO: ``,
  PAYMENT_REQUIREMENT_STEP_THREE: ``,
};

export default strings;