import { PlatformStrings } from './platform';

const strings: PlatformStrings = {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: `
    Provide a notarized response from your Wise account page to complete registration. Base ETH is required to
    submit a registration transaction.
  `,

  // Mail Instructions
  SIGN_IN_WITH_GOOGLE_INSTRUCTIONS: `
    no-op
  `,
  NO_EMAILS_ERROR: `
    no-op
  `,

  // Notarizations Instructions
  NO_NOTARIZATIONS_ERROR: `
    No Wise tags found.
    Please follow instructions in the extension to notarize an existing Wise account tag in the account page.
  `,

  // New Registration
  REGISTRATION_INSTRUCTIONS: `
    You must register in order to use ZKP2P. Registration requires a notarized message from Wise, which is used
    to prove you own a Wise account. Your Wise ID is hashed to conceal your identity.
  `,

  // On Ramp Instructions
  PROOF_FORM_TITLE_SEND_INSTRUCTIONS: `
    Provide the transaction alert email you received from Wise containing "You have done a UPI txn"
    to complete the order. You can sign in with Google to pull the email or manually upload/paste
    the email.
  `,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: `
    Depositing requires registering a valid Wise multi currency id. Provide the USDC liquidity to deposit and
    desired USDC/EUR conversion rate. You will receive EUR payments from users who claim your deposit.
  `,
  NEW_DEPOSIT_ADDITIONAL_REGISTRATION_TOOLTIP: `
    This is a second registration step required for depositors only to connect a Wise multi currency id
    to your account.
  `,
  NEW_DEPOSIT_ID_TOOLTIP: `
    This is a valid Wise tag where users will send payments.
    This connects your Wise tag to your address on chain.
    This must match the Wise tag you used to register.
  `,
  NEW_DEPOSIT_NAME_TOOLTIP: `
    no-op
  `,
  NEW_DEPOSIT_AMOUNT_TOOLTIP: `
    This is the amount of USDC you will deposit for users to claim by sending you Wise payments.
    You can withdraw unclaimed USDC or USDC not locked for orders at any time.
  `,
  NEW_DEPOSIT_RECEIVE_TOOLTIP: `
    This is the amount of EUR you will receive if your entire deposit is claimed.
  `,

  // Instruction Drawer
  INSTRUCTION_DRAWER_STEP_ONE: `
    Enter an amount to receive a quote. You are assigned the best available rate for the requested amount
  `,
  INSTRUCTION_DRAWER_STEP_TWO: `
    Optionally, provide a recipient address below to receive funds in another wallet. Submit transaction to start your order
  `,
  INSTRUCTION_DRAWER_STEP_THREE: `
    Click 'Send' and complete the payment on any UPI ID linked to your Wise bank account. Ensure you have email notifications from Wise InstaAlerts enabled
  `,
  INSTRUCTION_DRAWER_STEP_FOUR: `
    Continue through to validate email proof of transaction. Submit transaction containing proof to receive the requested USDC
  `,

  // Payment Requirements
  PAYMENT_REQUIREMENT_STEP_ONE: `
    Send payment from your UPI ID linked to your Wise bank account. Do not send payment from UPI Lite or other bank accounts
  `,
  PAYMENT_REQUIREMENT_STEP_TWO: `
    Wise InstaAlert email notifications are enabled for your account
  `,
  PAYMENT_REQUIREMENT_STEP_THREE: `
    Send the exact INR amount including decimals as displayed on the payment screen
  `,
  PAYMENT_REQUIREMENT_STEP_FOUR: `
    Lorem ipsum dolor sit ament
  `,
};

export default strings;
