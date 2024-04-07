import { PlatformStrings } from './platform';

const strings: PlatformStrings = {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: `
    Use the ZKP2P extension to generate a proof of Wise account. Provide the proof to complete registration. Base ETH is required to
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
    No Wise tag proofs found.
    Please follow instructions in the extension to prove an existing Wise account.
  `,
  NO_TRANSFER_NOTARIZATIONS_ERROR: `
    No Wise transfer proofs found.
    Please follow instructions in the extension to prove an existing Wise payment.
  `,

  // New Registration
  REGISTRATION_INSTRUCTIONS: `
    You must register in order to use ZKP2P. Click on Register above to initiate registration.
  `,

  // On Ramp Instructions
  PROOF_FORM_TITLE_SEND_INSTRUCTIONS: `
    Generate a proof of payment using the ZKP2P Extension to complete the order.
  `,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: `
    Depositing requires registering a valid Wise multi currency account id. Provide the USDC liquidity to deposit and
    desired USDC/EUR conversion rate. You will receive EUR payments from users who claim your deposit.
  `,
  NEW_DEPOSIT_ADDITIONAL_REGISTRATION_TOOLTIP: `
    This is a second registration step required ONLY for depositors to connect a Wise multi currency account id
    to your account.
  `,
  NEW_DEPOSIT_ID_TOOLTIP: `
    This is a valid Wise tag where users will send payments.
    This connects your Wise tag to your address on chain.
    This Wise tag must be of the account with which you reigstered.
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
    Click 'Send' and complete the payment from your Wise account. Ensure you have access to a dekstop to prove the payment later
  `,
  INSTRUCTION_DRAWER_STEP_FOUR: `
    Continue through to generate and validate proof of payment. Submit transaction containing proof to receive the requested USDC
  `,

  // Payment Requirements
  PAYMENT_REQUIREMENT_STEP_ONE: `
    Send payment from your ZKP2P registered Wise acount
  `,
  PAYMENT_REQUIREMENT_STEP_TWO: `
    Chose the right receiving currency (EUR) while sending the payment
  `,
  PAYMENT_REQUIREMENT_STEP_THREE: `
    Send the exact amount including decimals as displayed above
  `,
  PAYMENT_REQUIREMENT_STEP_FOUR: ``,
};

export default strings;
