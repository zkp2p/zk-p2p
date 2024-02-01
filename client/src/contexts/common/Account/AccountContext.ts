import { createContext } from 'react';


interface AccountValues {
  isLoggedIn: boolean;
  loggedInEthereumAddress: string | null;
  loginStatus: string | null;
  authenticatedLogout: (() => void) | null;
  accountDisplay: string | null;
  network: string | null;
  accountStatus: string | null;
  connectStatus: string | null;
};

const defaultValues: AccountValues = {
  isLoggedIn: false,
  loggedInEthereumAddress: null,
  loginStatus: null,
  authenticatedLogout: null,
  accountDisplay: null,
  network: null,
  accountStatus: null,
  connectStatus: null
};

const AccountContext = createContext<AccountValues>(defaultValues);

export default AccountContext;
