import { createContext } from 'react'
import { Address } from 'wagmi';


interface AccountValues {
  isLoggedIn: boolean;
  loggedInEthereumAddress: Address | null;
  network: string | null;
}

const defaultValues: AccountValues = {
  isLoggedIn: false,
  loggedInEthereumAddress: null,
  network: null,
};

const AccountContext = createContext<AccountValues>(defaultValues)

export default AccountContext
