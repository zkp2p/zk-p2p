import { PlatformStrings } from './platform';

const strings: PlatformStrings = {
  // Proof Form
  PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS: `
    Provide a historical transaction email sent from Garanti BBVA containing "Para Transferi Bilgilendirmesi" in
    the subject received after 01 September 2023 to complete registration. Base ETH is required to submit a
    registration transaction if using an injected wallet.
  `,

  // Mail Instructions
  SIGN_IN_WITH_GOOGLE_INSTRUCTIONS: `
    Sign in with Google to pull in your Garanti transaction emails. The emails are not stored and never
    leave your browser. Read more:
  `,
  NO_EMAILS_ERROR: `
    No emails found.
    Please ensure you are using an email attached to a Garanti account with a receipt after 01 Sep.
  `,

  // New Registration
  REGISTRATION_INSTRUCTIONS: `
    You must register in order to use ZKP2P. Registration requires a confirmation email from Garanti
    with subject "Para Transferi Bilgilendirmesi", which is used to prove you own a Garanti account. Your Garanti ID is
    hashed to conceal your identity.
  `,

  // On Ramp Instructions
  PROOF_FORM_TITLE_SEND_INSTRUCTIONS: `
    Provide the transaction alert email you received from Garanti containing "Para Transferi Bilgilendirmesi"
    to complete the order. You can sign in with Google to pull the email or manually upload/paste
    the email.
  `,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: `
    Creating a new deposit requires you to submit your Garanti IBAN, the USDC liquidity to deposit, and
    desired USDC/TRY conversion rate. You will receive TRY payments from users who claim your deposit.
    Your Garanti IBAN will be made public on-chain.
  `,
  NEW_DEPOSIT_ID_TOOLTIP: `
    This is a valid IBAN where users will send payments.
    This connects your Garanti IBAN to your wallet address on chain.
    This must match the IBAN associated with your Garanti account.
  `,
  NEW_DEPOSIT_NAME_TOOLTIP:`
    This must be the name associated with your Garanti account. If it does not match
    payments will not go through and you will not be able to off-ramp`,
  NEW_DEPOSIT_AMOUNT_TOOLTIP: `
    This is the amount of USDC you will deposit for users to claim by sending you Garanti payments.
    You can withdraw unclaimed USDC or USDC not locked for orders at any time.
  `,
  NEW_DEPOSIT_RECEIVE_TOOLTIP: `
    This is the amount of TRY you will receive if your entire deposit is claimed.
  `,

  // Instruction Drawer
  INSTRUCTION_DRAWER_STEP_ONE: `
    Enter an amount to receive a quote. You are assigned the best available rate for the requested amount
  `,
  INSTRUCTION_DRAWER_STEP_TWO: `
    Optionally, provide a recipient address below to receive funds in another wallet. Submit transaction to start your order
  `,
  INSTRUCTION_DRAWER_STEP_THREE: `
    Click 'Send' and complete the payment using your Garanti bank account. Ensure you have email notifications from Garanti BBVA enabled
  `,
  INSTRUCTION_DRAWER_STEP_FOUR: `
    Continue through to validate email proof of transaction. Submit transaction containing proof to receive the requested USDC
  `,

  // Payment Requirements
  PAYMENT_REQUIREMENT_STEP_ONE: `
    Send payment from your Garanti bank account. Do not send payment from any other bank accounts
  `,
  PAYMENT_REQUIREMENT_STEP_TWO: `
    Ensure email notifications are enabled AND you have set the alert minimum to 10 TRY
  `,
  PAYMENT_REQUIREMENT_STEP_THREE: `
    Wait 24 hours after updating email notifications to send payment.
  `,
  PAYMENT_REQUIREMENT_STEP_FOUR: `Send the exact TRY amount including decimals as displayed on the payment screen`,
};

export default strings;
