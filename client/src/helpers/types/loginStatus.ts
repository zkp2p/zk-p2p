export const LoginStatus = {
  LOGGED_OUT: 'logged_out',
  AUTHENTICATED: 'authenticated',
  EOA: 'eoa'
};

export type LoginStatusType = typeof LoginStatus[keyof typeof LoginStatus];
