import { createContext } from 'react'


interface AccountValues {
  loggedInEthereumAddress: string;
  network: string;
  rampAddress: string;
  usdcAddress: string;
}

const defaultValues: AccountValues = {
  loggedInEthereumAddress: '',
  network: '',
  rampAddress: '',
  usdcAddress: ''
};

const AccountContext = createContext<AccountValues>(defaultValues)

export default AccountContext
