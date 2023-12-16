import { createContext } from 'react';


interface AccountValues {
  isLoggedIn: boolean;
  loggedInEthereumAddress: string | null;
  network: string | null;
  accountStatus: string | null;
  connectStatus: string | null;
  disconnectStatus: string | null;
};

const defaultValues: AccountValues = {
  isLoggedIn: false,
  loggedInEthereumAddress: null,
  network: null,
  accountStatus: null,
  connectStatus: null,
  disconnectStatus: null
};

const AccountContext = createContext<AccountValues>(defaultValues);

export default AccountContext;
