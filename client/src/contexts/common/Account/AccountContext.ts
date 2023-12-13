import { createContext } from 'react'


interface AccountValues {
  isLoggedIn: boolean;
  loggedInEthereumAddress: string | null;
  network: string | null;
}

const defaultValues: AccountValues = {
  isLoggedIn: false,
  loggedInEthereumAddress: null,
  network: null,
};

const AccountContext = createContext<AccountValues>(defaultValues)

export default AccountContext
