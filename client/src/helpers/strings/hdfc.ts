/*
 * Proof Form
 */

export const PROOF_FORM_TITLE_REGISTRATION_INSTRUCTIONS = `
  Provide any historical transaction email sent from HDFC containing "x" in the subject to
  complete registration. Base ETH is required to submit a registration transaction.
`;

/*
 * Instructions
 */

export const REGISTRATION_INSTRUCTIONS = `
  You must register in order to use ZKP2P. Registration requires a confirmation email from HDFC
  with subject "x", which is used to prove you own a HDFC account. Your HDFC ID is
  hashed to conceal your identity.
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
  This is the amount of INR you will receive if your entire deposit is claimed.
`;