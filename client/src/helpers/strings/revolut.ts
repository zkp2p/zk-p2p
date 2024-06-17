import { PlatformStrings } from './platform';

const strings: PlatformStrings = {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: `
    Use the ZKP2P browser assistant to generate proof a valid Revolut account. Submit the proof to complete registration.
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
    No Revolut account proofs found.
    Please follow instructions in the browser sidebar to generate proof of an existing Revtag.
  `,
  NO_TRANSFER_NOTARIZATIONS_ERROR: `
    No Revolut transfer proofs detected.
    Please follow instructions in the browser sidebar to generate proof of payment from Revolut for the correct transaction.
  `,

  // New Registration
  REGISTRATION_INSTRUCTIONS: `
    You must register with a valid Revolut account to use ZKP2P. Your account details are hashed to conceal your identity.
  `,

  // On Ramp Instructions
  PROOF_FORM_TITLE_SEND_INSTRUCTIONS: `
    Prove a successful Revolut payment using the browser assistant to complete the order and receive USDC.
  `,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: `
    Creating a new deposit requires you to submit a valid Revolut Revtag, the USDC liquidity to deposit, and
    desired fiat conversion rate. Your Revtag must match the registered Revtag. 
  `,
  NEW_DEPOSIT_ADDITIONAL_REGISTRATION_TOOLTIP: `
    This is a second registration step required only for depositors to connect a Revolut depositor ID
    to your account.
  `,
  NEW_DEPOSIT_ID_TOOLTIP: `
    This is a valid Revtag where users will send payments.
    This connects your Revtag to your address on chain.
    This Revtag must be from the account you registered with.
  `,
  NEW_DEPOSIT_NAME_TOOLTIP: `
    no-op
  `,
  NEW_DEPOSIT_AMOUNT_TOOLTIP: `
    This is the amount of USDC you will deposit for users to claim by sending you Revolut payments.
    You can withdraw unclaimed USDC or USDC not locked for orders at any time.
  `,
  NEW_DEPOSIT_RECEIVE_TOOLTIP: `
    This is the amount of fiat currency you will receive if your entire deposit is claimed.
  `,

  // Instruction Drawer
  INSTRUCTION_DRAWER_STEP_ONE: `
    Enter USDC amount to receive to get a quote. You are assigned the best available rate for the requested amount
  `,
  INSTRUCTION_DRAWER_STEP_TWO: `
    Submit transaction to start your order. Optionally, provide a recipient address below to receive funds in another wallet
  `,
  INSTRUCTION_DRAWER_STEP_THREE: `
    Click 'Send' and complete the payment on Revolut. Ensure you have access to a desktop to prove the payment later
  `,
  INSTRUCTION_DRAWER_STEP_FOUR: `
    Continue through to generate and validate proof of payment. Submit proof to receive the requested USDC
  `,

  // Payment Requirements
  PAYMENT_REQUIREMENT_STEP_ONE: `
    Send payment from your ZKP2P registered Revolut account
  `,
  PAYMENT_REQUIREMENT_STEP_TWO: `
    Choose a send currency and ensure the receive currency is set to the same requested currency above when making the payment.
  `,
  PAYMENT_REQUIREMENT_STEP_THREE: `
    Send the exact amount including decimals as displayed above
  `,
  PAYMENT_REQUIREMENT_STEP_FOUR: ``,
};

export default strings;
