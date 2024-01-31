export interface CommonStrings {
  // Environment Banner
  LOCAL_ENV_BANNER: string,
  STAGING_TESTNET_ENV_BANNER: string,
  STAGING_ENV_BANNER: string,
  PRODUCTION_ENV_BANNER: string,

  // Registration NFT Tooltip
  REGISTRATION_NFT_TOOLTIP: string,

  // Mail Input
  INPUT_MODE_TOOLTIP: string,
  EMAIL_TOOLTIP: string,
  PROVING_TYPE_TOOLTIP: string,
  UPLOAD_TYPE_TOOLTIP: string,
  PROOF_TOOLTIP: string,
  PROOF_FORM_UPLOAD_EMAIL_INSTRUCTIONS: string,
  PROOF_FORM_PASTE_EMAIL_INSTRUCTIONS: string,

  // Release Funds Modal
  RELEASE_FUNDS_WARNING_ONE: string,
  RELEASE_FUNDS_WARNING_TWO: string,

  // Login Modal
  LOGIN_MODAL_TOOLTIP: string,

  // Deposit Modal
  DEPOSIT_FUNDS_INSTRUCTIONS: string

  // Pay Modal
  PAY_MODAL_INSTRUCTIONS: string,

  // Proof Modal Steps
  PROOF_MODAL_DOWNLOAD_TITLE: string,
  PROOF_MODAL_DOWNLOAD_SUBTITLE: string,
  PROOF_MODAL_UPLOAD_TITLE: string,
  PROOF_MODAL_UPLOAD_SUBTITLE: string,
  PROOF_MODAL_PROVE_TITLE: string,
  PROOF_MODAL_PROVE_REGISTRATION_TITLE: string,
  PROOF_MODAL_PROVE_SUBTITLE_PRIVATE: string,
  PROOF_MODAL_PROVE_SUBTITLE_FAST: string,
  PROOF_MODAL_PROVE_REGISTRATION_SUBTITLE_FAST: string,
  PROOF_MODAL_VERIFY_TITLE: string,
  PROOF_MODAL_VERIFY_SUBTITLE: string,
  PROOF_MODAL_SUBMIT_TITLE: string,
  PROOF_MODAL_REGISTRATION_SUBMIT_TITLE: string,
  PROOF_MODAL_SUBMIT_SUBTITLE: string,
  PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE: string,
};

const strings: CommonStrings = {
  // Environment Banner
  LOCAL_ENV_BANNER: `
    You are currently viewing the application on localhost
  `,
  STAGING_TESTNET_ENV_BANNER: `
    You are currently viewing the staging-testnet application
  `,
  STAGING_ENV_BANNER: `
    You are currently viewing the staging application
  `,
  PRODUCTION_ENV_BANNER: `
    ZKP2P's Alpha Launch —
  `,

  // Registration NFT Tooltip
  REGISTRATION_NFT_TOOLTIP: `
    Mint a Soulbound NFT that proves you successfully registered passing the on chain verifier. The
    NFT has no value and cannot be transferred. This is optional and does not affect protocol usage.
  `,

  // Mail Input
  INPUT_MODE_TOOLTIP: `
    Drag the .eml file into the box to automatically load the contents.
    You can also Paste the contents directly.
  `,
  EMAIL_TOOLTIP: `
    Open any Venmo transaction email and select 'Show original' to view the full contents.
  `,
  PROVING_TYPE_TOOLTIP: `
    Fast verification sends your email to our servers for processing (30 to 60 seconds).
    Private verification processes locally in your browser (10 minutes).
  `,
  UPLOAD_TYPE_TOOLTIP: `
    Login uses Google authentication to pull in your past Venmo transaction emails.
    Data is NEVER stored.
    Upload requires you to manually input the .eml file.
  `,
  PROOF_TOOLTIP: `
    The proof is a cryptographic signature that shows you sent the email using contents
    and signatures that exist in the email.
  `,
  PROOF_FORM_UPLOAD_EMAIL_INSTRUCTIONS: `
    Follow this guide to download and input the email.
  `,
  PROOF_FORM_PASTE_EMAIL_INSTRUCTIONS: `
    Follow this guide to copy and paste the email.
  `,

  // Release Funds Modal
  RELEASE_FUNDS_WARNING_ONE: `
    Submit this transaction to release
  `,
  RELEASE_FUNDS_WARNING_TWO: `
    to the requester. This bypasses requiring the user to submit proof of the transaction
    and may result in loss of funds.
  `,

  // Login Modal
  LOGIN_MODAL_TOOLTIP: `
    Use a social account if you do not have already have funds on the blockchain.
    Use an Ethereum wallet if you already have one.
  `,

  // Deposit Modal
  DEPOSIT_FUNDS_INSTRUCTIONS: `
    This address can only receive USDC from Base Network. Don't send any tokens from other networks,
    or it may result in loss of funds.
  `,

  // Pay Modal
  PAY_MODAL_INSTRUCTIONS: `
    All transactions are peer-to-peer. Review all of the requirements below before sending a payment
    to prevent loss of funds.
  `,
  PROOF_MODAL_DOWNLOAD_TITLE: `
    Downloading Verification Keys
  `,
  PROOF_MODAL_DOWNLOAD_SUBTITLE: `
    Keys download (1.7GB) will complete in 3 minutes
  `,
  PROOF_MODAL_UPLOAD_TITLE: `
    Uploading Emails
  `,
  PROOF_MODAL_UPLOAD_SUBTITLE: `
    Email is sent to remote server for proving
  `,
  PROOF_MODAL_PROVE_TITLE: `
    Validating Payment
  `,
  PROOF_MODAL_PROVE_REGISTRATION_TITLE: `
    Validating Email
  `,
  PROOF_MODAL_PROVE_SUBTITLE_PRIVATE: `
    Private validation will take approximately 10 minutes
  `,
  PROOF_MODAL_PROVE_SUBTITLE_FAST: `
    Payment validation can take up to 60 seconds
  `,
  PROOF_MODAL_PROVE_REGISTRATION_SUBTITLE_FAST: `
    Email validation can take up to 60 seconds
  `,
  PROOF_MODAL_VERIFY_TITLE: `
    Local Proof Verification
  `,
  PROOF_MODAL_VERIFY_SUBTITLE: `
    Constructing and verifying transaction
  `,
  PROOF_MODAL_SUBMIT_TITLE: `
    Complete Order
  `,
  PROOF_MODAL_REGISTRATION_SUBMIT_TITLE: `
    Complete Registration
  `,
  PROOF_MODAL_SUBMIT_SUBTITLE: `
    Submit transaction to complete the on ramp
  `,
  PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE: `
    Submit transaction to complete registration
  `,
};

export class CommonStringProvider {
  private strings: CommonStrings;

  constructor() {
    this.strings = strings;
  }

  get(key: keyof CommonStrings): string {
    return this.strings[key];
  }
};
